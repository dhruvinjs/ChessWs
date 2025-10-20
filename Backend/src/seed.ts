// import {PrismaClient} from '@prisma/client'
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Seeding database...");

//   // --- 1. Create Users ---
//   const passwordHash = await bcrypt.hash("password123", 10);

//   const alice = await prisma.user.create({
//     data: {
//       name: "Alice",
//       email: "alice@example.com",
//       password: passwordHash,
//       chessLevel: "BEGINNER",
//     },
//   });

//   const bob = await prisma.user.create({
//     data: {
//       name: "Bob",
//       email: "bob@example.com",
//       password: passwordHash,
//       chessLevel: "INTERMEDIATE",
//     },
//   });

//   const charlie = await prisma.user.create({
//     data: {
//       name: "Charlie",
//       email: "charlie@example.com",
//       // Google user without password
//       googleId: "google-uid-123",
//       chessLevel: "PRO",
//     },
//   });

//   // --- 2. Create Games ---
//   await prisma.game.createMany({
//     data: [
//       {
//         moves: ["e4", "e5", "Nf3", "Nc6"],
//         winnerId: alice.id,
//         loserId: bob.id,
//         draw: false,
//       },
//       {
//         moves: ["d4", "d5", "c4", "c6"],
//         winnerId: bob.id,
//         loserId: alice.id,
//         draw: false,
//       },
//       {
//         moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
//         draw: true,
//       },
//       {
//         moves: ["g3", "d5", "Bg2", "Nf6"],
//         winnerId: charlie.id,
//         loserId: alice.id,
//         draw: false,
//       },
//     ],
//   });

//   console.log("Seeding finished!");
// }

// // main()
// //   .catch((e) => {
// //     console.error(e);
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     await prisma.$disconnect();
// //   });
