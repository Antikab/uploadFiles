const http = require('http');
const fs = require('fs');
const path = require('path');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    const uploadDir = path.join(__dirname, 'uploads');

    // Создаем директорию для загрузок, если она не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    let fileData = Buffer.alloc(0);

    req.on('data', chunk => {
      fileData = Buffer.concat([fileData, chunk]);
    });

    req.on('end', () => {
      const boundary =
        '--' + req.headers['content-type'].split('; ')[1].split('=')[1];
      const parts = fileData.toString().split(boundary);
      const filePart = parts[1].split('\r\n\r\n')[1].split('\r\n--')[0];
      const contentDisposition = parts[1].split('\r\n')[1];
      const fileName = contentDisposition.match(/filename="(.+)"/)[1];

      const filePath = path.join(uploadDir, fileName);

      fs.writeFile(filePath, filePart, err => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Ошибка при сохранении файла' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Файл успешно загружен' }));
        }
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Страница не найдена' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
