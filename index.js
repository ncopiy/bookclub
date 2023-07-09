const DB_PREFIX = "db/"
const CURRENT_DB = DB_PREFIX + "current.json";
const NAVIGATION_DB = DB_PREFIX + "navigation.json";

function formatEndOfStrings(text) {
    return text.replaceAll('\n', '<br>');
}

function getFormattedPost(post) {
    let text = [
        `<div class="post-block">`,
        `<h1>${post.title}</h1>`,
        `<h2>${post.author}</h2>`,
        `<p class="main-pic">
            <img src="${post.main_pic}" class="book-cover">
        </p>`,
        `<p class="date">${post.ts_end}</p>`,
        `<p class="annotation">${formatEndOfStrings(post.annotation)}</p><br>`,
    ].join('');

    for (let j = 0; j < post.quotes.length; j++) {
        text += `<blockquote>${formatEndOfStrings(post.quotes[j])}</blockquote>`;
    }

    text = text + `</div><br>`;

    return text;
}

function getFormattedPosts(posts) {
    let text = "";

    for (let i = 0; i < posts.length; i++) {
        text += getFormattedPost(posts[i]);
    }

    return text;
}

function getNavigationLink(name, source) {
    return [
        `<div onclick='fillPosts("`,
        source,
        `");'>`,
        name,
        `</div>`,
    ].join('');
}

function getFormattedNavigation(navigation) {
    let text = "<ul>";

    for (let i = 0; i < navigation.length; i++) {
        text += "<li>";
        if (navigation[i].source.length > 0) {
            text += getNavigationLink(navigation[i].name, DB_PREFIX + navigation[i].source);
        } else {
            text += navigation[i].name;
        }

        if (navigation[i].inner.length > 0) {
            text += "<ul>";
            for (let j = 0; j < navigation[i].inner.length; j++) {
                text += "<li>";
                text += getNavigationLink(navigation[i].inner[j].name, DB_PREFIX + navigation[i].inner[j].source);
                text += "</li>";
            }
            text += "</ul>";
        }
        text += "</li>";
    }

    text += "</ul>";

    return text;
}

async function fetchData(source) {
    try {
        const response = await fetch(source);
        if (!response.ok) {
            return null;
        }
        posts = await response.json();
    } catch (error) {
        return null;
    }
    return posts;
}

async function fillNavigation() {
    navigation = await fetchData(NAVIGATION_DB);
    if (navigation == null) {
        return
    }

    $(".top-menu").html(getFormattedNavigation(navigation.navigation));
}

async function fillPosts(source) {
    posts = await fetchData(source);
    if (posts == null) {
        return
    }

    $(".posts").html(getFormattedPosts(posts.posts));
}

async function fillMainData() {
    await fillNavigation();
    await fillPosts(CURRENT_DB);
}

fillMainData();
