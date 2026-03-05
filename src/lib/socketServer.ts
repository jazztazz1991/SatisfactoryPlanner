import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

export interface CursorPosition {
  x: number;
  y: number;
}

export interface RoomUser {
  userId: string;
  name: string;
  color: string;
}

const USER_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

// Track users per plan room
const planRooms = new Map<string, Map<string, RoomUser>>();

function getNextColor(planId: string): string {
  const room = planRooms.get(planId);
  const usedColors = room ? new Set([...room.values()].map((u) => u.color)) : new Set<string>();
  return USER_COLORS.find((c) => !usedColors.has(c)) ?? USER_COLORS[0];
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const planNamespace = io.of("/plan");

  planNamespace.on("connection", (socket: Socket) => {
    let currentPlanId: string | null = null;
    let currentUser: RoomUser | null = null;

    socket.on("join-plan", (data: { planId: string; userId: string; userName: string }) => {
      const { planId, userId, userName } = data;

      // Leave previous room if any
      if (currentPlanId) {
        socket.leave(currentPlanId);
        planRooms.get(currentPlanId)?.delete(socket.id);
        planNamespace.to(currentPlanId).emit("presence", {
          users: Array.from(planRooms.get(currentPlanId)?.values() ?? []),
        });
      }

      currentPlanId = planId;
      currentUser = {
        userId,
        name: userName,
        color: getNextColor(planId),
      };

      // Join room
      socket.join(planId);

      if (!planRooms.has(planId)) {
        planRooms.set(planId, new Map());
      }
      planRooms.get(planId)!.set(socket.id, currentUser);

      // Broadcast updated presence to everyone in the room
      planNamespace.to(planId).emit("presence", {
        users: Array.from(planRooms.get(planId)!.values()),
      });
    });

    socket.on("leave-plan", () => {
      if (currentPlanId) {
        socket.leave(currentPlanId);
        planRooms.get(currentPlanId)?.delete(socket.id);
        planNamespace.to(currentPlanId).emit("presence", {
          users: Array.from(planRooms.get(currentPlanId)?.values() ?? []),
        });
        currentPlanId = null;
        currentUser = null;
      }
    });

    socket.on("cursor-move", (data: { x: number; y: number }) => {
      if (currentPlanId && currentUser) {
        socket.to(currentPlanId).emit("cursor-update", {
          userId: currentUser.userId,
          name: currentUser.name,
          color: currentUser.color,
          x: data.x,
          y: data.y,
        });
      }
    });

    socket.on("target-changed", (data: { action: string; target: unknown }) => {
      if (currentPlanId) {
        socket.to(currentPlanId).emit("target-changed", data);
      }
    });

    socket.on("solver-result", (data: { result: unknown }) => {
      if (currentPlanId) {
        socket.to(currentPlanId).emit("solver-result", data);
      }
    });

    socket.on("plan-updated", (data: { field: string; value: unknown }) => {
      if (currentPlanId) {
        socket.to(currentPlanId).emit("plan-updated", data);
      }
    });

    socket.on("disconnect", () => {
      if (currentPlanId) {
        planRooms.get(currentPlanId)?.delete(socket.id);
        const room = planRooms.get(currentPlanId);
        if (room && room.size === 0) {
          planRooms.delete(currentPlanId);
        } else if (room) {
          planNamespace.to(currentPlanId).emit("presence", {
            users: Array.from(room.values()),
          });
        }
        // Notify others that cursor is gone
        planNamespace.to(currentPlanId).emit("cursor-remove", {
          userId: currentUser?.userId,
        });
      }
    });
  });

  return io;
}
