import {Hono} from 'hono'
import {userRoute} from "./routes/user";
import {blogRoute} from "./routes/blog";


const app = new Hono<{
    Bindings: {
        DATABASE_URL: string
    }
}>();

app.route('api/v1/user',userRoute)
app.route('/api/v1/blog',blogRoute);

export default app
