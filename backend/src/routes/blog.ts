import {Hono} from "hono";
import {PrismaClient} from "@prisma/client/edge";
import {withAccelerate} from "@prisma/extension-accelerate";
import {verify} from "hono/jwt";


export const blogRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string
    }
}>();


//Middleware
blogRoute.use('/*', async (c, next) => {
    const header = c.req.header('authorization') || ' ';
    try {
        const token = header.split(" ")[1];
        const response = await verify(token, c.env.JWT_SECRET);
        if (!response) {
            c.status(403);
            return c.json({message: "unauthorized"})
        }
        c.set('userId', response.id)

        await next();
    } catch (e) {
        c.status(403);
        return c.json({
            message: "You are not login"
        })
    }

})

blogRoute.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({});

    return c.json(posts);
})

blogRoute.get('/:id', async (c) => {
    const id = c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.findUnique({
        where: {
            id
        }
    });

    return c.json(post);
})

blogRoute.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const userId = c.get("userId");
    try {
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.title,
                published: body.published,
                authorId: userId
            }
        })
        return c.json({
            blog
        })
    } catch (e) {
        return c.json({
            e: "Error"
        });
    }
})


