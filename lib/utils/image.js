import url from 'url';
import path from 'path';
import uuid from 'node-uuid';
import fs from 'fs';
import co from 'co';
import easyimg from 'easyimage';
import request from 'superagent';

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


export function deleteThumbnail(name) {

    return new Promise((resolve, reject) => {
        fs.unlink(thumbnailPath(name), (err) => {
            if (err)  {
                reject(err);
            } else {
                console.log(name + " is deleted");
                resolve();
            }
        });
    });
}

export function* createThumbnail (src) {

    const data = yield fetchImage(src);

    const basename = url.parse(src).pathname,
          ext = path.parse(basename).ext,
          image = uuid.v4() + ext,
          filename = thumbnailPath(image);

    // maybe check ext first...
    //

    yield function*() {
        fs.writeFile(filename, data, (err) => {
            if (err) throw err;
        });
    }();

    yield easyimg
        .resize({
            src: filename,
            dst: filename,
            width: 300,
            height: 500
        })

    return image;

};


