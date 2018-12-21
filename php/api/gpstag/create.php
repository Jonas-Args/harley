<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// get database connection
include_once '../config/database.php';
 
// instantiate product object
include_once '../objects/GPSTag.php';
 
$database = new Database();
$db = $database->getConnection();
 
$gpsTag = new GPSTag($db);
 
// get posted data
$data = json_decode(file_get_contents("php://input"));

// make sure data is not empty
if(
    !empty($data->Id) &&
    !empty($data->PanelCode) &&
    !empty($data->PanelNAme) &&
    !empty($data->GPSLoc) &&
    !empty($data->Status) &&
    !empty($data->REmarks) &&
    !empty($data->WeekCode) &&
    !empty($data->REceipted)
    /*add field here */
){
 
    // set product property values
    $gpsTag->Id = $data->Id;
    $gpsTag->PanelCode = $data->PanelCode;
    $gpsTag->PanelNAme = $data->PanelNAme;
    $gpsTag->GPSLoc = $data->GPSLoc;
    $gpsTag->Status = $data->Status;
    $gpsTag->REmarks =  $data->REmarks;
    $gpsTag->REceipted = $data->REceipted;
    $gpsTag->WeekCode = $data->WeekCode;
    $gpsTag->created = date('Y-m-d H:i:s');
     /*add field here */
 
    // create the product
    if($gpsTag->create()){
 
        // set response code - 201 created
        http_response_code(201);
 
        // tell the user
        echo json_encode(array("message" => "Product was created."));
    }
 
    // if unable to create the product, tell the user
    else{
 
        // set response code - 503 service unavailable
        http_response_code(503);
 
        // tell the user
        echo json_encode(array("message" => "Unable to create product."));
    }
}
 
// tell the user data is incomplete
else{
    // set response code - 400 bad request
    http_response_code(400);
 
    // tell the user
    echo json_encode(array("message" => "Unable to create product. Data is incomplete."));
}
?>