require("dotenv").config()

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const allowedOrigins = [
    "http://localhost:5173",
    "https://tempo-mu-dun.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {

        if (!origin) {
            return callback(null, true);
        }

        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 3000

app.get('/', (request, response) => {
    response.send('Backend is working')
})

app.get('/tasks',authenticateUser,async (request,response) =>{
    const userId = request.user.id
    try{
        const result = await pool.query(
            `SELECT
                id,
                title,
                deadline::text AS deadline,
                estimated_effort AS "estimatedEffort",
                completed_effort AS "completedEffort",
                completed
             FROM tasks
             WHERE user_id = $1
             ORDER BY id`,
        [userId]
        )

        const stageResult = await pool.query(
            `SELECT
                 stage.id,
                 stage.task_id AS "taskId",
                 stage.stage_number AS "stageNumber",
                 stage.title,
                 stage.owner_type AS "ownerType",
                 stage.owner_name AS "ownerName",
                 stage.completed,
                 stage.follow_up_date::text AS "followUpDate"
             FROM task_stages AS stage
                      JOIN tasks AS task
                           ON stage.task_id = task.id
             WHERE task.user_id = $1
             ORDER BY stage.task_id, stage.stage_number`,
            [userId]
        )

        const taskWithStages = result.rows.map((task)=>{
            const taskStages = stageResult.rows.filter(
                (stage) => stage.taskId === task.id
            )
            return{
                ...task,stages: taskStages
            }
            })

        response.json(taskWithStages)

    }
    catch(error){
        console.error(error)
        response.status(500).json({error: 'Database error'})
    }

})

app.post('/tasks',authenticateUser,async (request,response) =>{

    const userId = request.user.id

    const{
        title,
        deadline,
        estimatedEffort,
        completedEffort,
        stages = Array.isArray(request.body.stages)
            ? request.body.stages
            : []
    } = request.body

    const client = await pool.connect()

    try{
        await client.query('BEGIN')

        const result = await client.query(
            `INSERT INTO tasks
                (user_id,title, deadline, estimated_effort, completed_effort)
             VALUES ($1, $2, $3, $4,$5)
             RETURNING
                id,
                title,
                deadline::text AS deadline,
                estimated_effort AS "estimatedEffort",
                completed_effort AS "completedEffort",
                completed`,
            [
                userId,
                title,
                deadline,
                estimatedEffort,
                completedEffort
            ]
        )
        const createdTask = result.rows[0]

        const createdStages = []

        for(let index=0;index<stages.length;index++){
            const stage = stages[index]

            const stageResult = await client.query(
                `
                INSERT INTO task_stages (
                    task_id,
                    stage_number,
                    title,
                    owner_type,
                    owner_name,
                    follow_up_date
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                    
                RETURNING
                id,
                task_id AS "taskId",
                stage_number AS "stageNumber",
                title,
                owner_type AS "ownerType",
                owner_name AS "ownerName",
                completed,
                follow_up_date::text AS "followUpDate"
                `,
                [
                    createdTask.id,
                    index +1,
                    stage.title,
                    stage.ownerType,
                    stage.ownerName || null,
                    stage.followUpDate || null
                ]
            )
            createdStages.push(stageResult.rows[0])
        }
        await client.query('COMMIT')

        response.status(201).json({...createdTask,stages: createdStages})
    }
    catch (error) {
        await client.query('ROLLBACK')

        console.error(error)

        response.status(500).json({
            error: 'Database error'
        })
    }

    finally {
        client.release()
    }
})

app.patch('/tasks/:id', authenticateUser ,async (request, response) => {
    const userId = request.user.id
    try {
        const id = request.params.id
        const hours = Number(request.body.hours)

        if (!Number.isFinite(hours) || hours <= 0) {
            return response.status(400).json({
                error: "Hours must be greater than 0"
            })
        }

        const result = await pool.query(
            `UPDATE tasks
             SET completed_effort = completed_effort + $1
             WHERE id = $2
                 AND user_id = $3
             RETURNING
                id,
                title,
                deadline::text AS deadline,
                estimated_effort AS "estimatedEffort",
                completed_effort AS "completedEffort"`,
            [hours, id,userId]
        )

        if (result.rows.length === 0) {
            return response.status(404).json({
                error: "Task not found"
            })
        }

        response.json(result.rows[0])
    }
    catch (error) {
        console.error(error)
        response.status(500).json({ error: 'Database error' })
    }
})

app.patch('/stages/:id',authenticateUser, async (request, response)=>{
    const userId = request.user.id
    const id = request.params.id
    const { completed } = request.body

    try{
        const result = await pool.query(
            `
            UPDATE task_stages AS stage
            SET completed = $1
            FROM tasks AS task
            WHERE stage.id = $2
              AND stage.task_id = task.id
              AND task.user_id = $3
            RETURNING
                stage.id,
                stage.task_id AS "taskId",
                stage.stage_number AS "stageNumber",
                stage.title,
                stage.owner_type AS "ownerType",
                stage.owner_name AS "ownerName",
                stage.completed,
                stage.follow_up_date::text AS "followUpDate"
            `,
            [completed, id,userId]
        )
        if (result.rows.length === 0) {
            return response.status(404).json({
                error: 'Stage not found'
            })
        }
            response.json(result.rows[0])

        }

    catch (error) {
            console.error(error)

            response.status(500).json({
                error: 'Database error'
            })
        }

})

app.patch('/tasks/:id/complete',authenticateUser,async(request,response)=>{
    const userId = request.user.id
    const id = request.params.id

    try{
        const result = await pool.query(
            `
            UPDATE tasks
            SET completed = TRUE
            WHERE id = $1
                AND user_id = $2
            RETURNING
                id,
                completed
            `,[id,userId]
        )

        if(result.rows.length ===0){
            return response.status(404).json({error: 'Task not found'})
        }

        response.json(result.rows[0])
    }

    catch(error){
        console.error(error)

        response.status(500).json({
            error: 'Database error'
        })
    }

})

app.patch('/tasks/:id/estimate',authenticateUser, async (request,response)=>{
    const userId = request.user.id
    const id = request.params.id
    const { minutes } = request.body

    if (!Number.isFinite(Number(minutes)) || Number(minutes) <= 0) {
        return response.status(400).json({
            error: 'Minutes must be greater than 0'
        })
    }

    try{
        const result = await pool.query(
            `
                UPDATE tasks
                SET estimated_effort = estimated_effort + ($1/60.0)
                WHERE id = $2
                    AND user_id = $3
                RETURNING
                id,
                estimated_effort AS "estimatedEffort"
            `,[minutes,id,userId]
        )

        if(result.rows.length ===0){
            return response.status(404).json({error: 'Task not found'})
        }

        response.json(result.rows[0])
    }

    catch(error){
        console.error(error)

        response.status(500).json({
            error: 'Database error'
        })
    }
})

app.patch('/tasks/:id/details',authenticateUser, async (request, response) => {
    const userId = request.user.id
    const id = request.params.id

    const {
        title,
        deadline,
        estimatedEffort
    } = request.body

    try {
        const result = await pool.query(
            `
            UPDATE tasks
            SET
                title = $1,
                deadline = $2,
                estimated_effort = $3
            WHERE id = $4
                AND user_id = $5
            RETURNING
                id,
                title,
                deadline::text AS deadline,
                estimated_effort AS "estimatedEffort"
            `,
            [
                title,
                deadline,
                estimatedEffort,
                id,
                userId
            ]
        )

        if (result.rows.length === 0) {
            return response.status(404).json({
                error: 'Task not found'
            })
        }

        response.json(result.rows[0])
    }

    catch (error) {
        console.error(error)

        response.status(500).json({
            error: 'Database error'
        })
    }
})

//Edit Stage:
app.patch("/stages/:id/details", authenticateUser, async (request, response) => {
        const id = request.params.id
        const userId = request.user.id

        const {
            title,
            ownerType,
            ownerName,
            followUpDate
        } = request.body

        try {
            const result = await pool.query(
                `
                UPDATE task_stages AS stage
                SET
                    title = $1,
                    owner_type = $2,
                    owner_name = $3,
                    follow_up_date = $4
                FROM tasks AS task
                WHERE stage.id = $5
                  AND stage.task_id = task.id
                  AND task.user_id = $6
                RETURNING
                    stage.id,
                    stage.task_id AS "taskId",
                    stage.stage_number AS "stageNumber",
                    stage.title,
                    stage.owner_type AS "ownerType",
                    stage.owner_name AS "ownerName",
                    stage.completed,
                    stage.follow_up_date::text AS "followUpDate"
                `,
                [
                    title,
                    ownerType,
                    ownerName || null,
                    followUpDate || null,
                    id,
                    userId
                ]
            )

            if (result.rows.length === 0) {
                return response.status(404).json({
                    error: "Stage not found"
                })
            }

            response.json(result.rows[0])

        } catch (error) {
            console.error(error)

            response.status(500).json({
                error: "Database error"
            })
        }
    }
)

//Add a new stage
app.post(
    "/tasks/:id/stages",
    authenticateUser,
    async (request, response) => {

        const taskId = request.params.id
        const userId = request.user.id

        const {
            title,
            ownerType,
            ownerName,
            followUpDate
        } = request.body

        try {

            const taskResult = await pool.query(
                `
                SELECT id
                FROM tasks
                WHERE id = $1
                  AND user_id = $2
                `,
                [taskId, userId]
            )

            if (taskResult.rows.length === 0) {
                return response.status(404).json({
                    error: "Task not found"
                })
            }


            const stageNumberResult =
                await pool.query(
                    `
                    SELECT
                        COALESCE(
                            MAX(stage_number),
                            0
                        ) + 1 AS "nextStageNumber"
                    FROM task_stages
                    WHERE task_id = $1
                    `,
                    [taskId]
                )


            const nextStageNumber =
                stageNumberResult.rows[0]
                    .nextStageNumber


            const result = await pool.query(
                `
                INSERT INTO task_stages (
                    task_id,
                    stage_number,
                    title,
                    owner_type,
                    owner_name,
                    follow_up_date
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                RETURNING
                    id,
                    task_id AS "taskId",
                    stage_number AS "stageNumber",
                    title,
                    owner_type AS "ownerType",
                    owner_name AS "ownerName",
                    completed,
                    follow_up_date::text AS "followUpDate"
                `,
                [
                    taskId,
                    nextStageNumber,
                    title,
                    ownerType,
                    ownerName || null,
                    followUpDate || null
                ]
            )

            response
                .status(201)
                .json(result.rows[0])

        } catch (error) {
            console.error(error)

            response.status(500).json({
                error: "Database error"
            })
        }
    }
)

// Delete a stage
app.delete("/stages/:id", authenticateUser, async (request, response) => {
        const id = request.params.id
        const userId = request.user.id

        try {
            const result = await pool.query(
                `
                DELETE FROM task_stages AS stage
                USING tasks AS task
                WHERE stage.id = $1
                  AND stage.task_id = task.id
                  AND task.user_id = $2
                RETURNING
                    stage.id,
                    stage.task_id AS "taskId"
                `,
                [id, userId]
            )

            if (result.rows.length === 0) {
                return response.status(404).json({
                    error: "Stage not found"
                })
            }

            response.json(result.rows[0])

        } catch (error) {
            console.error(error)

            response.status(500).json({
                error: "Database error"
            })
        }
    }
)



//Login queries:
app.post("/auth/register", async (request, response) => {
    const { email, password } = request.body

    if (!email || !password) {
        return response.status(400).json({
            error: "Email and password are required"
        })
    }

    if (password.length < 8) {
        return response.status(400).json({
            error: "Password must be at least 8 characters"
        })
    }

    const normalizedEmail = email.trim().toLowerCase()

    try {
        const passwordHash = await bcrypt.hash(password, 12)

        const result = await pool.query(`
            INSERT INTO users (
                email,
                password_hash
            )
            VALUES ($1, $2)
            RETURNING
                id,
                email,
                created_at AS "createdAt"
        `, [
            normalizedEmail,
            passwordHash
        ])

        response.status(201).json(result.rows[0])

    } catch (error) {

        if (error.code === "23505") {
            return response.status(409).json({
                error: "An account with this email already exists"
            })
        }

        console.error(error)

        response.status(500).json({
            error: "Database error"
        })
    }
})

app.post("/auth/login", async (request, response) => {
    const {email, password} = request.body

    if (!email || !password) {
        return response.status(400).json({
            error: "Email and password are required"
        })
    }

    const normalizedEmail = email.trim().toLowerCase()

    try {
        const result = await pool.query(`
            SELECT id,
                   email,
                   password_hash
            FROM users
            WHERE email = $1
        `, [normalizedEmail])

        if (result.rows.length === 0) {
            return response.status(401).json({
                error: "Invalid email or password"
            })
        }

        const user = result.rows[0]

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        )

        if (!passwordMatches) {
            return response.status(401).json({
                error: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        response.cookie("tempo_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        response.json({
            id: user.id,
            email: user.email
        })

    } catch (error) {
        console.error(error)

        response.status(500).json({
            error: "Server error"
        })
    }
})

//Checks if user is authenticated/logged in by checking the jwt or cookie browser sends
function authenticateUser(request, response, next) {
    const token = request.cookies.tempo_token

    if (!token) {
        return response.status(401).json({
            error: "Not authenticated"
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        request.user = {
            id: decoded.userId,
            email: decoded.email
        }

        next()

    } catch (error) {
        return response.status(401).json({
            error: "Invalid or expired session"
        })
    }
}

app.get("/auth/me", authenticateUser, (request, response) => {
    response.json(request.user)
})


app.delete('/tasks/:id',authenticateUser, async (request, response) => {
    const userId = request.user.id
    try {
        const id = request.params.id

        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
                 AND user_id = $2
             RETURNING id`,
            [id,userId]
        )

        if (result.rows.length === 0) {
            return response.status(404).json({
                error: 'Task not found'
            })
        }

        response.status(204).send()
    }
    catch (error) {
        console.error(error)
        response.status(500).json({ error: 'Database error' })
    }
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

