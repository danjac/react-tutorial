export default function*() {
    yield this.render('index', { csrfToken: this.csrf });
};
