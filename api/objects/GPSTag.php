<?php
class GPSTag{
 
    // database connection and table name
    private $conn;
    private $table_name = "GPSTag";
 
    // object properties
    public $Id;
    public $PanelCode;
    public $PanelNAme;
    public $GPSLoc;
    public $Status;
    public $REmarks;
    public $REceipted;
    public $WeekCode;
    public $created;
    public $updated;
    /*add field here */
 
    // constructor with $db as database connection
    public function __construct($db){
        $this->conn = $db;
    }

    // read products
  function read(){
    // select all query
    $query = "SELECT * FROM " . $this->table_name;

    // prepare query statement
    $stmt = $this->conn->prepare($query);

    // execute query
    $stmt->execute();
    return $stmt;
  }

    // create product
  function create(){

    // query to insert record
    $query = "INSERT INTO
                " . $this->table_name . "
            SET
            PanelCode=:PanelCode, 
            PanelNAme=:PanelNAme, 
            GPSLoc=:GPSLoc, 
            Status=:Status, 
            REmarks=:REmarks, 
            REceipted=:REceipted, 
            created=:created,
            updated=:created,
            Id=:Id,
            WeekCode=:WeekCode
            ";
            /*add field here  with comma*/

    // prepare query
    $stmt = $this->conn->prepare($query);

    // sanitize
    $this->PanelCode=htmlspecialchars(strip_tags($this->PanelCode));
    $this->PanelNAme=htmlspecialchars(strip_tags($this->PanelNAme));
    $this->GPSLoc=htmlspecialchars(strip_tags($this->GPSLoc));
    $this->Status=htmlspecialchars(strip_tags($this->Status));
    $this->REmarks=htmlspecialchars(strip_tags($this->REmarks));
    $this->REceipted=htmlspecialchars(strip_tags($this->REceipted));
    $this->created=htmlspecialchars(strip_tags($this->created));
    $this->updated=htmlspecialchars(strip_tags($this->updated));
    $this->Id=htmlspecialchars(strip_tags($this->Id));
    $this->WeekCode=htmlspecialchars(strip_tags($this->WeekCode));
    /*add field here */

    // bind values
    $stmt->bindParam(":PanelCode", $this->PanelCode);
    $stmt->bindParam(":PanelNAme", $this->PanelNAme);
    $stmt->bindParam(":GPSLoc", $this->GPSLoc);
    $stmt->bindParam(":Status", $this->Status);
    $stmt->bindParam(":REmarks", $this->REmarks);
    $stmt->bindParam(":REceipted", $this->REceipted);
    $stmt->bindParam(":created", $this->created);
    $stmt->bindParam(":updated", $this->created);
    $stmt->bindParam(":Id", $this->Id);
    $stmt->bindParam(":WeekCode", $this->WeekCode);
    /*add field here */

    // execute query
    if($stmt->execute()){
        return true;
    }

    return false;
    
  }

  // used when filling up the update product form
  function readOne(){

      // query to read single record
      $query = "SELECT * FROM " . $this->table_name . " p WHERE p.Id = ? LIMIT 0,1";
      
      // prepare query statement
      $stmt = $this->conn->prepare( $query );

      // bind id of product to be updated
      $stmt->bindParam(1, $this->Id);
      // execute query
      $stmt->execute();

      // get retrieved row
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
  
      // set values to object properties
      $this->Id = $row['Id'];
      $this->PanelCode = $row['PanelCode'];
      $this->PanelNAme = $row['PanelNAme'];
      $this->GPSLoc = $row['GPSLoc'];
      $this->Status = $row['Status'];
      $this->REmarks = $row['REmarks'];
      $this->REceipted = $row['REceipted'];
      $this->created = $row['created'];
      $this->updated = $row['updated'];
      $this->WeekCode = $row['WeekCode'];
      /*add field here */
  }

  // update the product
  function update(){
  
    // update query
    $query = "UPDATE
                " . $this->table_name . "
            SET
              PanelCode=:PanelCode, 
              PanelNAme=:PanelNAme, 
              GPSLoc=:GPSLoc, 
              Status=:Status, 
              REmarks=:REmarks, 
              REceipted=:REceipted, 
              updated=:updated 
              WeekCode=:WeekCode
            WHERE
                Id = :Id";
            /*add field here */
    // prepare query statement
    $stmt = $this->conn->prepare($query);

    // sanitize
    $this->PanelCode=htmlspecialchars(strip_tags($this->PanelCode));
    $this->PanelNAme=htmlspecialchars(strip_tags($this->PanelNAme));
    $this->GPSLoc=htmlspecialchars(strip_tags($this->GPSLoc));
    $this->Status=htmlspecialchars(strip_tags($this->Status));
    $this->REmarks=htmlspecialchars(strip_tags($this->REmarks));
    $this->REceipted=htmlspecialchars(strip_tags($this->REceipted));
    $this->updated=htmlspecialchars(strip_tags($this->updated));
    $this->Id=htmlspecialchars(strip_tags($this->Id));
    $this->WeekCode=htmlspecialchars(strip_tags($this->WeekCode));
    /*add field here */

    // bind values
    $stmt->bindParam(":PanelCode", $this->PanelCode);
    $stmt->bindParam(":PanelNAme", $this->PanelNAme);
    $stmt->bindParam(":GPSLoc", $this->GPSLoc);
    $stmt->bindParam(":Status", $this->Status);
    $stmt->bindParam(":REmarks", $this->REmarks);
    $stmt->bindParam(":REceipted", $this->REceipted);
    $stmt->bindParam(":updated", $this->updated);
    $stmt->bindParam(":Id", $this->Id);
    $stmt->bindParam(":WeekCode", $this->WeekCode);
    /*add field here */

    // execute the query
    if($stmt->execute()){
        return true;
    }

    return false;
  }

// delete the product
  function delete(){
  
    // delete query
    $query = "DELETE FROM " . $this->table_name . " WHERE Id = ?";
    // var_dump($query);
    // prepare query
    $stmt = $this->conn->prepare($query);

    // sanitize
    $this->Id=htmlspecialchars(strip_tags($this->Id));

    // var_dump($this->Id);
    // bind id of record to delete
    $stmt->bindParam(1, $this->Id);

    // execute query
    if($stmt->execute()){
        return true;
    }

    return false;
    
  }

}