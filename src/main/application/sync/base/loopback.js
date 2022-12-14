import { createServer } from 'http'
import { reject } from 'lodash'

class Loopback {
  startServer(port) {
    if (this.server) this.stopServer()

    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res, resolve)
      })
      this.server.on('error', error => reject(error))
      this.server.listen(port)
    })
  }

  stopServer() {
    this.server.close()
    this.server = null
  }

  handleRequest(req, res, resolve) {
    const url = new URL(req.url, 'http://localhost:4567')
    if (url.pathname === '/auth/callback') {
      if (url.searchParams.get('code')) {
        this.success(res)
        resolve(url.searchParams.get('code'))
      } else {
        this.error(res, url.searchParams.get('error'))
        reject(url.searchParams.get('error'))
      }
    }
  }

  success(res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(this.successHTML())
    res.end()
  }

  error(res, error) {
    res.writeHead(400, { 'Content-type': 'text/html' })
    res.write(this.errorHTML(error))
    res.end()
  }

  successHTML() {
    return `<!DOCTYPE html>
      <html lang="en">
        ${this.headHTML()}
        <body>
          <div class="message"><h2>You’ve successfully connected!</h2><p>You may now close this window and proceed to Swifty app.</p></div>
        </body>
      </html>
    `
  }

  errorHTML(error) {
    return `<!DOCTYPE html>
      <html lang="en">
       ${this.headHTML()}
        <body>
          <div class="message"><h2>Failed to connect your Google Drive account.</h2><p>Connection failed with error: '${error}'.</p></div>
        </body>
      </html>
    `
  }

  headHTML() {
    return `
      <head>
        <meta charset="UTF-8" />
        <title>Connection Failure</title>
        <style>
          body { font-family: Arial,Helvetica,sans-serif; }
          .message {
            width: 420px;
            margin: 0 auto;
            padding: 64px 0;
            text-align: center;
            background-repeat: no-repeat;
            background-position: top center;
            background-image: url('data:image/png;base64,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');
          }
          .message h2 {color: #333;}
          .message p {color: #777;}
        </style>
      </head>`
  }
}

const loopback = new Loopback()

export { loopback }
