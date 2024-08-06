const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function RoomSeeder() {
  return new Promise(async (resolve, reject) => {
    let data = [];
    for (let i = 1; i <= 11; i++) {
      data.push({
        no_room: i,
        monthly_price: 1200000,
      });
    }
    try {
      const deleteRoom = await prisma.room.deleteMany({});

      await prisma.room.createMany({
        data: data,
      });
      resolve("Success create room seeds");
    } catch (error) {
      reject(error.message);
    }
  });
}

module.exports = RoomSeeder;
