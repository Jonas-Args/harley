<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
class Database{
 
    // specify your own database credentials
    private $host = "mytest.cpr7vrlf90vf.us-east-1.rds.amazonaws.com";
    private $db_name = "test";
    private $username = "test";
    private $password = "mypassword";
    public $conn;
 
    // get the database connection
    public function getConnection(){
 
        $this->conn = null;
 
        try{
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        }catch(PDOException $exception){
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
?>
