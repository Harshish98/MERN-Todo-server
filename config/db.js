const { default: mongoose } = require("mongoose")

async function ConnectDb() {
try {
    await mongoose.connect('mongodb+srv://harshish3498:todo123456@todocluster.ypjetjz.mongodb.net/?retryWrites=true&w=majority&appName=todocluster');
    console.log('database connected')
} catch (error) {
    console.log(error)
}
}

module.exports = ConnectDb;