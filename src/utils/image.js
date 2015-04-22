import url from 'url';
import path from 'path';
import uuid from 'node-uuid';
import fs from 'fs';
import easyimg from 'easyimage';
import request from 'superagent';

const allowedExtensions = [".jpg", ".png", ".gif"];

export const thumbnailDir = path.join(process.cwd(), 'public', 'uploads');

export function thumbnailPath (filename) {
    return path.join(thumbnailDir, filename);
};

const fetchImage = function (src) {
    return new Promise((resolve, reject) => {
        request
        .get(src)
        .end((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.body);
            }
        });
    });

};


export function deleteThumbnail(name) {
    return new Promise((resolve, reject) => {
        fs.unlink(thumbnailPath(name), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const resizeImage = (filename, data) => {
    return new Promise((resolve, reject) => {
        const fullpath = thumbnailPath(filename);

        fs.writeFile(fullpath, data, (err) => {
            if (err) {
                return reject(err);
            }
            easyimg
            .resize({
                src: fullpath,
                dst: fullpath,
                width: 300,
                height: 500
            })
            .then((image) => {
                resolve(filename);
            });
        });
    });
};

export function createThumbnail (src) {

    if (!src) {
        throw new Error("Image is empty");
    }

    return fetchImage(src)
    .then((data) => {
        const basename = url.parse(src).pathname,
              ext = path.parse(basename).ext.toLowerCase(),
              filename = uuid.v4() + ext;
        if (!allowedExtensions.includes(ext)) {
            throw new Error("Must be an image file!");
        }
        return resizeImage(filename, data);
    }).then((filename) => {
        return filename;
    });

}


