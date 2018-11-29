//import mqtt to be used
const mqtt = require("mqtt");
const broker = "mqtt://broker.mqttdashboard.com";
//connect to the database
const nano = require("nano")("http://localhost:5984");
//used databases for the mqtt
let hydrantHistory = nano.use("hydrant_history");
let hydrantCondition = nano.use("hydrant_condition");

mqtt_client = mqtt.connect(broker);

//when connected, subscribe to a hydrant in order to retrieve the sensor information
mqtt_client.on("connect", () => {
  mqtt_client.publish("hydrant/presence", "Server running");
  console.log("Connected to Broker");
  mqtt_client.subscribe("/hydrant/#");
});

//disconnect from broker
mqtt_client.on("diconnect", () => {
  console.log("Disconnected from broker");
});

//message shown in mqtt
mqtt_client.on("message", async (topic, msg) => {
  let hydrantId = topic.split("/")[2];
  let data = msg.toString().split("\t");
//temperature sensor
  let temperature = Number.parseFloat(data[0].split(" ")[1]);
  //pressure sensor
  let pressure = Number.parseFloat(data[1].split(" ")[1]);
  let sensorData = {
    name: hydrantId,
    temperature,
    pressure,
    time: Date.now()
  };
  try {
    //initialize inserting into hydrantHistory database
    let response = await hydrantHistory.insert(sensorData);

    //retrieve the database view
    let hydrant = await hydrantCondition.view(
      "hydrantCondition",
      "getHydrant",
      { key: hydrantId, include_docs: false }
    );

    //insert into the database the rows retrieved 
    if (hydrant && hydrant.rows && hydrant.rows.length) {
      let doc = hydrant.rows[0].value;
      doc.temperature = temperature;
      doc.pressure = pressure;
      let res = await hydrantCondition.insert(doc);
    }
    console.log(response);
  } catch (err) {
    console.log(err);
  }
});
