const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function UserSeeder() {
  return new Promise(async (resolve, reject) => {
    let data = [
      {
        name: "Admin",
        email: "admin@admin.com",
        password: await bcrypt.hash("admin12345", 10),
        role: "ADMIN",
      },
      {
        name: "User",
        email: "user@user.com",
        phone: "6281314206253",
        password: await bcrypt.hash("user12345", 10),
        role: "USER",
      },
    ];
    try {
      const deleteUser = await prisma.user.deleteMany({});

      for (item of data) {
        await prisma.user.create({
          data: {
            ...item,
            my_room: {
              create: {},
            },
          },
        });
      }
      resolve("Success create user seeds");
    } catch (error) {
      reject(error.message);
    }
  });
}

module.exports = UserSeeder;
