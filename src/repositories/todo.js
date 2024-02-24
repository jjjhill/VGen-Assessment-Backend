export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return collection.insertOne(todo);
    }

    async function getAll(userID) {
        return collection.find({ userID }).sort({ created: -1 }).toArray();
    }

    async function updateOne(filter, update) {
        return collection.updateOne(filter, update)
    }

    return {
        insertOne,
        getAll,
        updateOne
    };
};