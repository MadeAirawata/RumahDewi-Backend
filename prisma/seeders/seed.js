const { PrismaClient } = require("@prisma/client");
const UserSeeder = require("./user-seed");
const RoomSeeder = require("./room-seed");

const prisma = new PrismaClient();

async function main() {
  const createUser = await UserSeeder();
  const createRoom = await RoomSeeder();

  console.log(createUser);
  console.log(createRoom);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
