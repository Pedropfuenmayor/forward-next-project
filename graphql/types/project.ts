// /graphql/types/Link.ts
import { objectType, extendType, stringArg, nonNull, intArg } from "nexus";
import { Challenge } from "./challenge";
import { getSession } from "next-auth/react";
import { ProjectType } from "../../models/models";
import validator from "validator";

export const Project = objectType({
  name: "Project",
  definition(t) {
    t.int("id");
    t.string("name");
    t.int("user_id");
    t.list.field("challenges", {
      type: Challenge,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.projects
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .challenges();
      },
    });
  },
});

export const ProjectsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("projects", {
      type: "Project",
      resolve(_parent, _args, ctx) {
        return ctx.prisma.projects.findMany();
      },
    });
    t.field("isProject", {
      type: "Project",
      args: {
        userId: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {

        const { req } = ctx;

        const session = await getSession({ req });

        if (!session) {
          throw Error("Not authenticated!");
        }

        const { userId } = args;

        return ctx.prisma.projects.findFirst({where:{user_id:userId}});
      },
    });
    t.field("getProjectById", {
      type: "Project",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {

        // const { req } = ctx;

        // const session = await getSession({ req });

        // if (!session) {
        //   throw Error("Not authenticated!");
        // }

        const { id } = args;

        return ctx.prisma.projects.findUnique({where:{id}});
      },
    });
  },
});

export const ProjectMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createProject", {
      type: "Project",
      args: {
        id: nonNull(intArg()),
        name: nonNull(stringArg()),
        user_id: nonNull(intArg()),
      },
      async resolve(_root, args: ProjectType, ctx) {

        const { req } = ctx;

        const session = await getSession({ req });

        if (!session) {
          throw Error("Not authenticated!");
        }

        const { id, name, user_id } = args;

        if (validator.isEmpty(name)) {
          throw Error("Empty project name.");
        }

        const existingProject = await ctx.prisma.projects.findFirst({
          where: {
            name
          },
        });

        if (existingProject) {
          throw Error("Project already exist");
        }

        const project: ProjectType = {
          name,
           id,
           user_id
         };

        return ctx.prisma.projects.create({ data: project });
      },
    });
    // t.nonNull.field("updateUser", {
    //   type: "User",
    //   args: {
    //     oldPassword: nonNull(stringArg()),
    //     newPassword: nonNull(stringArg()),
    //     email: nonNull(stringArg()),
    //   },
    //   async resolve(_root, args: UpdateUserType, ctx) {

    //     const { req } = ctx;

    //     const session = await getSession({ req });

    //     if (!session) {
    //       throw Error("Not authenticated!");
    //     }

    //     const { email, oldPassword, newPassword } = args;

    //     const existingUser = await ctx.prisma.users.findFirst({
    //       where: { email },
    //     });

    //     if (!existingUser) {
    //       throw new Error("No user found");
    //     }

    //     if (!validator.isLength(newPassword, { min: 7 })) {
    //       throw Error("Password must be 7 caracters long");
    //     }

    //     const isValid = await verifyPassword(
    //       oldPassword,
    //       existingUser.password
    //     );

    //     if (!isValid) {
    //       throw new Error("Invalid password");
    //     }

    //     const hashedPassword = await hashPassword(newPassword);

    //     const updatedUser = await ctx.prisma.users.update({
    //       where: { id: existingUser.id },
    //       data: {
    //         password: hashedPassword,
    //       },
    //     });

    //     return updatedUser;
    //   },
    // });
    // t.nonNull.field("deleteUser", {
    //   type: "User",
    //   args: {
    //     password: nonNull(stringArg()),
    //     email: nonNull(stringArg()),
    //   },
    //   async resolve(_root, args: DeleteUserType, ctx) {

    //     const { req } = ctx;

    //     const session = await getSession({ req });

    //     if (!session) {
    //       throw Error("Not authenticated!");
    //     }

    //     const { email, password } = args;

    //     const existingUser = await ctx.prisma.users.findFirst({
    //       where: { email },
    //     });

    //     if (!existingUser) {
    //       throw new Error("No user found");
    //     }

    //     const isValid = await verifyPassword(password, existingUser.password);

    //     if (!isValid) {
    //       throw new Error("Invalid password");
    //     }

    //     const deletedUser = await ctx.prisma.users.delete({
    //       where: { id: existingUser.id },
    //     });

    //     return deletedUser;
    //   },
    // });
  },
});