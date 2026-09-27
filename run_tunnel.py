import subprocess
import re
import sys
import os

try:
    import qrcode
except ImportError:
    os.system("pip install qrcode")
    import qrcode

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    cmd = ["cloudflared", "tunnel", "--url", "https://localhost:5173", "--no-tls-verify"]
    
    # Run cloudflared and capture output
    process = subprocess.Popen(
        cmd, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        text=True, 
        bufsize=1,
        encoding='utf-8',
        errors='replace'
    )

    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")
    found_url = False

    for line in process.stdout:
        # Print the original cloudflared log line
        print(line, end="")
        sys.stdout.flush()
        
        # Look for the URL if we haven't found it yet
        if not found_url:
            match = url_pattern.search(line)
            if match:
                url = match.group(0)
                found_url = True
                
                print("\n\n" + "="*70)
                print(f" SCAN THIS QR CODE WITH YOUR IPAD CAMERA ")
                print(f"URL: {url}")
                print("="*70 + "\n")
                
                # Generate and print the ASCII QR code
                qr = qrcode.QRCode(border=2)
                qr.add_data(url)
                qr.make(fit=True)
                
                # Print ASCII blocks
                qr.print_ascii(invert=True)
                
                print("\n" + "="*70 + "\n")

    process.wait()

if __name__ == "__main__":
    main()
