$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:9000/")
$http.Start()

Write-Host "PowerShell HTTP server started on http://localhost:9000/"
Write-Host "Press CTRL+C to stop"

try {
    while ($http.IsListening) {
        $context = $http.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $responseString = "<html><body><h1>PowerShell Server Works!</h1><p>If you can see this, localhost is working.</p></body></html>"
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