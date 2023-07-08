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
        text += [
            `<div class="post-block">`,
            `<h1>${books[i].title}</h1>`,
            `<h2>${books[i].author}</h2>`,
            `<p class="main-pic">
                <img src="${books[i].main_pic}" class="book-cover">
            </p>`,
            `<p class="date">${books[i].ts_end}</p>`,
            `<p class="annotation">${formatEndOfStrings(books[i].annotation)}</p><br>`,
        ].join('');

        for (let j = 0; j < books[i].quotes.length; j++) {
            text += `<blockquote>${formatEndOfStrings(books[i].quotes[j])}</blockquote>`;
        }

        text = text + `</div><br>`;
    }

    $(".posts").html(text);
}

fillPosts();
