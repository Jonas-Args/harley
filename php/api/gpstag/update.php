<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// include database and object files
include_once '../config/database.php';
include_once '../objects/GPSTag.php';
 
// get database connection
$database = new Database();
$db = $database->getConnection();
 
// prepare product object
$gpsTag = new GPSTag($db);
 
// get id of product to be edited
$data = json_decode(file_get_contents("php://input"));

// set ID property of product to be edited
$gpsTag->Id = $data->Id;
 
// set product property values
$gpsTag->Id = $data->Id;
$gpsTag->PanelCode = $data->PanelCode;
$gpsTag->PanelNAme = $data->PanelNAme;
$gpsTag->GPSLoc = $data->GPSLoc;
$gpsTag->Status = $data->Status;
$gpsTag->REmarks =  $data->REmarks;
$gpsTag->REceipted = $data->REceipted;
$gpsTag->WeekCode = $data->WeekCode;
$gpsTag->updated = date('Y-m-d H:i:s');
/*add field here */
 
// update the product
if($gpsTag->update()){
 
    // set response code - 200 ok
    http_response_code(200);
 
    // tell the user
    echo json_encode(array("message" => "Product was updated."));
}
 
// if unable to update the product, tell the user
else{
 
    // set response code - 503 service unavailable
    http_response_code(503);
 
    // tell the user
    echo json_encode(array("message" => "Unable to update product."));
}
?>
