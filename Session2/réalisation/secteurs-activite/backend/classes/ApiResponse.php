<?php

declare(strict_types=1);

/**
 * Centralise le formatage des réponses JSON de l'API.
 */
class ApiResponse
{
    public static function success($data = null, int $statusCode = 200): never
    {
        http_response_code($statusCode);
        echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $statusCode = 400, array $errors = []): never
    {
        http_response_code($statusCode);
        $payload = ['success' => false, 'message' => $message];
        if ($errors) {
            $payload['errors'] = $errors;
        }
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
