$http = New-Object System.Net.HttpListener
$http.Prefixes.Add("http://10.93.35.186:8888/")
$http.Prefixes.Add("http://localhost:8888/")
$http.Start()

Write-Host "HTTP Server running on http://10.93.35.186:8888/"
Write-Host "Press CTRL+C to stop"

try {
    while ($http.IsListening) {
        $context = $http.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $responseString = "<html><body><h1>HTTP Server Works!</h1><p>Server IP: 10.93.35.186</p><p>If you can see this, LAN IP is working!</p></body></html>"
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