$http = New-Object System.Net.HttpListener
$http.Prefixes.Add("http://localhost:8888/")
$http.Prefixes.Add("http://10.93.35.186:8888/")
$http.Start()

Write-Host "HTTP Server starting on http://localhost:8888/ and http://10.93.35.186:8888/"
Write-Host "Press CTRL+C to stop"

try {
    while ($http.IsListening) {
        $context = $http.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $responseString = "<html><body><h1>Test Server Works!</h1><p>Server is running!</p><p>If you can see this, the connection works!</p></body></html>"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseString)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        
        Write-Host "Request from $($request.RemoteEndPoint) - $($request.Url)"
    }
}
finally {
    $http.Stop()
    Write-Host "Server stopped"
}