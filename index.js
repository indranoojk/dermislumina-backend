require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
const colors = require("colors");

connectToMongo();

const app = express();

const port = process.env.PORT;

app.use(cors())
app.use(express.json())



app.get("/", async (req, res) => {
  try {
    res.status(200).json({ msg: "I am in home route" });
  } catch (error) {
    res.status(500).json({ msg: "Error in home route" });
  }
});


app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, async () => {
      console.log(colors.rainbow(`Backend is running on port ${port}`));
})