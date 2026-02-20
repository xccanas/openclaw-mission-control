# Simple TCP listener in PowerShell (no external dependencies)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:9000/")
$listener.Start()

Write-Host "Listening on http://localhost:9000/" -ForegroundColor Green
Write-Host "Press CTRL+C to stop" -ForegroundColor Yellow

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $responseString = "<html><body><h1>PowerShell Test Server Works!</h1><p>If you can see this, PowerShell HTTP is working.</p></body></html>"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseString)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        
        Write-Host "Request from $($request.RemoteEndPoint) - $($request.Url)" -ForegroundColor Cyan
    }
}
finally {
    $listener.Stop()
    Write-Host "Server stopped" -ForegroundColor Red
}