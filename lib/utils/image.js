import url from 'url';
import path from 'path';
import uuid from 'node-uuid';
import fs from 'fs';
import co from 'co';
import easyimg from 'easyimage';
import request from 'superagent';

const allowedExtensions = [".jpg", ".png", ".gif"];

export const thumbnailDir = path.join(process.cwd(), 'uploads');

export const thumbnailPath = (filename) => {
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


export function* deleteThumbnail(name) {
    fs.unlink(thumbnailPath(name), (err) => {
        if (err) {
            throw err;
        }
    });
}

export function* createThumbnail (src) {

    if (!src) {
        throw new Error("Image is empty");
    }
    const data = yield fetchImage(src);

    const basename = url.parse(src).pathname,
          ext = path.parse(basename).ext.toLowerCase(),
          image = uuid.v4() + ext,
          filename = thumbnailPath(image);

    if (!allowedExtensions.includes(ext)) {
        throw new Error("Must be an image file!");
    }

    yield function*() {
        fs.writeFile(filename, data, (err) => {
            if (err) {
                throw err;
            }
        });
    }();

    yield easyimg
        .resize({
            src: filename,
            dst: filename,
            width: 300,
            height: 500
        });

    return image;

}


