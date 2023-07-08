async function fetchCurrentPosts(posts) {
    try {
        const response = await fetch(`db/current.json`);
        if (!response.ok) {
            return null;
        }
        posts = await response.json();
    } catch (error) {
        return null;
    }
    return posts;
}

async function fillPosts() {
    var posts = {};

    posts = await fetchCurrentPosts();
    if (posts == null) {
        return
    }

    books = posts["books"];

    let text = "";

    for (let i = 0; i < books.length; i++) {
        text = text + `<div class="post-block">`;
        text = text + `<h1>${books[i].title}</h1>`;
        text = text + `<h2>${books[i].author}</h2>`;
        text = text + `
        <p class="main-pic">
            <img src="${books[i].main_pic}" class="book-cover">
        </p>`;
        text = text + `<p class="date">${books[i].ts_end}</p>`;
        text = text + `<p class="annotation">${books[i].annotation}</p>`;

        for (let j = 0; j < books[i].quotes.length; j++) {
            quote = books[i].quotes[j].replaceAll('\n', '<br>');
            text = text + `<blockquote>${quote}</blockquote>`;
        }

        text = text + `</div><br>`;
    }

    $(".posts").html(text);
}

fillPosts();
