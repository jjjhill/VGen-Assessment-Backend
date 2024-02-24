import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // get all todos belonging to the current user
    router.get('/', auth, async (req, res) => {
        const session = verifyToken(req.cookies['todox-session']);
        const { userID } = session

        try {
            const resultTodos = await todoRepository.getAll(userID)
    
            return res.status(200).send(resultTodos);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: `Fetching Todos failed for user ${userID}.`});
        }
    })

    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            const session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            const newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                completed: false
            };

            if (validateTodo(newTodo)) {
                const resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // Patch method to do partial update of a todo document
    router.patch('/:todoID', auth, async (req, res) => {
        try {
            const session = verifyToken(req.cookies['todox-session']);
            const { userID } = session;
            const { todoID } = req.params;
            const { completed } = req.body;

            await todoRepository.updateOne({ userID, todoID }, { $set: { completed } });

            return res.status(200).send();
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Updating Todo completed status failed."});
        }
    });

    return router;
}
