const supabase =  require("./db.js");
const express = require('express'); 
const cors = require('cors');
require('dotenv').config();
const app = express(); 
const PORT = process.env.port;

app.use(express.json());
app.use(cors({origin: '*'}));



app.get('/division', async (req, res) => {
    try{
        const data = await supabase.any('SELECT id, name FROM "Division"');
        res.json(data);
    }
    catch(error){
        console.log(error);
    }
});

app.post('/district', async (req, res) => {
    try{
        const division = req.body['division']; 
        const data = await supabase.any('SELECT id, name FROM "District" WHERE "divisionId" = $1', [division]);
        res.json(data);
    }
    catch(error){
        console.log(error);
    }
});

app.post('/upazilla', async (req, res) => {
    try{
        const district = req.body['district']; 
        const data = await supabase.any('SELECT id, name FROM "Upazilla" WHERE "districtId" = $1', [district]);
        res.json(data);
    }
    catch(error){
        console.log(error);
    }
});

app.post('/union', async (req, res) => {
    try{
        const upazilla = req.body['upazilla']; 
        const data = await supabase.any('SELECT id, name FROM "UnionParishad" WHERE "upazillaId" = $1', [upazilla]);
        res.json(data);
    }
    catch(error){
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Pushti-LocationMS is running on port ${PORT}`);
});