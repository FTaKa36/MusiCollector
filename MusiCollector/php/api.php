<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dbFile = __DIR__ . '/data/database.json';

function getDb($dbFile) {
    if (!file_exists($dbFile)) {
        return ['albums' => [], 'annotations' => [], 'contributors' => []];
    }
    $content = file_get_contents($dbFile);
    return json_decode($content, true) ?: ['albums' => [], 'annotations' => [], 'contributors' => []];
}

function saveDb($dbFile, $data) {
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_data';
$data = getDb($dbFile);

if ($action === 'get_data') {
    echo json_encode([
        'status' => 'success',
        'data' => $data
    ]);
    exit;
}

if ($action === 'add_album' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $newAlbum = [
        'id' => 'alb-' . time(),
        'title' => htmlspecialchars($input['title'] ?? 'Untitled Album'),
        'artist' => htmlspecialchars($input['artist'] ?? 'Unknown Artist'),
        'genre' => htmlspecialchars($input['genre'] ?? 'pop'),
        'tracksCount' => intval($input['tracksCount'] ?? 10),
        'releaseYear' => htmlspecialchars($input['releaseYear'] ?? date('Y')),
        'cover' => htmlspecialchars($input['cover'] ?? '../assets/images/hero.jpg'),
        'views' => '1K',
        'featured' => false,
        'tracks' => []
    ];
    
    array_unshift($data['albums'], $newAlbum);
    saveDb($dbFile, $data);
    
    echo json_encode(['status' => 'success', 'message' => 'Album added successfully', 'album' => $newAlbum]);
    exit;
}

if ($action === 'add_annotation' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $newAnnotation = [
        'id' => 'ann-' . time(),
        'track' => htmlspecialchars($input['track'] ?? 'General'),
        'lyric' => htmlspecialchars($input['lyric'] ?? ''),
        'text' => htmlspecialchars($input['text'] ?? ''),
        'author' => htmlspecialchars($input['author'] ?? 'CollectorUser'),
        'votes' => 1
    ];
    
    $data['annotations'][] = $newAnnotation;
    saveDb($dbFile, $data);
    
    echo json_encode(['status' => 'success', 'annotation' => $newAnnotation]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
?>
