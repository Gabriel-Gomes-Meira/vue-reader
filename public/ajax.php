<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Conexão com o banco de dados PostgreSQL
$conn = pg_connect("host=localhost dbname=postgres user=postgres password=mysecretpassword");

// Query para obter a lista de clientes
$query = "SELECT nome FROM clients";
$result = pg_query($conn, $query);

// Array para armazenar os nomes dos clientes
$clientes = array();

// Loop para adicionar os nomes dos clientes ao array
while ($row = pg_fetch_assoc($result)) {
  $clientes[] = $row['name'];
}

// Saída em formato JSON
echo json_encode($clientes);
?>
