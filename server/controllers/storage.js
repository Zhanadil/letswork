const http = require('http');
const config = require('config');
const formdata = require('form-data');

const Company = require('@models/company');
const Student = require('@models/student');

// Функции связанные с сохранением файлов
module.exports = {
    // middleware функция устанавливает лимит на размеры файлов
    limitFileSize: (size) => {
        return (req, res, next) => {
            // Проверка на размер файлов
            for (var [fileKey, file] of Object.entries(req.files)) {
                if (file.data.length > size) {
                    return res.status(400).json({
                        error: `file size limit is ${size}`
                    });
                }
            }

            next();
        };
    },

    // Функция отправляет принятые файлы на файловый сервер и возвращаем ссылку на него
    // Адрес сервера находится в файлах конфигурации
    uploadMedia: async (req, res, next) => {
        // Проверяем, что файл был выслан
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                error: 'file not received'
            });
        }
        var file = req.files.file;

        // formdata которая будет отправлена на сервер
        var form = new formdata();

        form.append('file', req.files.file.data, {
            filename: req.files.file.name,
        });

        // Хедеры html запроса, включают в себя инфо о файле и токен для авторизации
        var headers = form.getHeaders();
        headers.authorization = req.headers.authorization;

        // Сам http запрос
        var request = http.request({
            method: 'put',
            host: config.FILE_SERVER_HOST,
            port: config.FILE_SERVER_PORT,
            path: '/store/media',
            headers,
        });

        // Отправляем файл
        form.pipe(request);

        request.on('error', (err) => {
            return res.status(500).json({
                error: err.message
            })
        });

        // Ответ на запрос присылается кусками
        // Присоединяем все куски к строке, а затем парсим в json
        var rawData = "";
        request.on('response', (response) => {
            response.on('data', function(data) {
                rawData += data;
            });
            response.on('end', () => {
                // Парсим в json
                try {
                    const jsonData = JSON.parse(rawData);
                    return res.status(response.statusCode).json(jsonData);
                } catch (error) {
                    // Если не смогли спарсить, то скорее всего ответ пришел в html
                    // Возвращаем в том же виде
                    return res.status(response.statusCode).send(rawData);
                }
            });
        });
    }
};
