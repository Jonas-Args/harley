<?php
// required headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
// database connection will be here

// include database and object files
include_once '../config/database.php';
include_once '../objects/GPSTag.php';

// instantiate database and product object
$database = new Database();
$db = $database->getConnection();
 
// initialize object
$gpsTag = new GPSTag($db);
 
// read products will be here
// query products
$stmt = $gpsTag->read();
$num = $stmt->rowCount();
 
// check if more than 0 record found
if($num>0){
 
    // products array
    $gpsTag_arr=array();
    $gpsTag_arr["records"]=array();
 
    // retrieve our table contents
    // fetch() is faster than fetchAll()
    // http://stackoverflow.com/questions/2770630/pdofetchall-vs-pdofetch-in-a-loop
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        // extract row
        // this will make $row['name'] to
        // just $name only
        extract($row);
 
        $gpsTag_item=array(
            "Id" => $Id,
            "PanelCode" => $PanelCode,
            "PanelNAme" =>$PanelNAme,
            "GPSLoc" => html_entity_decode($GPSLoc),
            "Status" => $Status,
            "REmarks" => $REmarks,
            "WeekCode" => $WeekCode,
            /*add here with comma*/
            "REceipted" => $REceipted
        );
 
        array_push($gpsTag_arr["records"], $gpsTag_item);
    }
 
    // set response code - 200 OK
    http_response_code(200);
 
    // show products data in json format
    echo json_encode($gpsTag_arr);
}
 
else{
 
  // set response code - 404 Not found
  http_response_code(404);

  // tell the user no products found
  echo json_encode(
      array("message" => "No products found.")
  );
}