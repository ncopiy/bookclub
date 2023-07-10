const DB_PREFIX = document.URL.includes("localhost") ? "db/test/" : "db/"
const CURRENT_DB = DB_PREFIX + "current.json";
const NAVIGATION_DB = DB_PREFIX + "navigation.json";

const PAGE_QUERY_PARAM = "page";

var SECTION_TAG_TO_DATA_SOURCE = {};

function formatEndOfStrings(text) {
    return text.replaceAll('\n', '<br>');
}

function getFormattedPost(post) {
    let text = [
        `<div class="post-block">`,
        `<a id=${post.anchor}>`,
        `<h1>${post.title}</h1>`,
        `</a>`,
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

function getFormattedTimeline(posts) {
    if (posts.length < 2) {
        return ``;
    }

    let text = `<div class="timeline">`;

    let step = 100 / (posts.length - 1);
    let percent = 0;

    for (let i = 0; i < posts.length; i++) {
        text += [
            `<div class="timeline-unit" style="left:`,
            `${percent}%;">`,
            `<a href="#`,
            posts[i].anchor,
            `" title="`,
            `${posts[i].author} - ${posts[i].title}`,
            `">`,
            posts[i].emoji,
            `</a>`,
            `</div>`
        ].join('');

        percent += step;
    }

    text += `</div>`;

    return text;
}


function getFormattedPosts(posts) {
    let text = `<div class="posts">`;

    for (let i = 0; i < posts.length; i++) {
        text += getFormattedPost(posts[i]);
    }

    text += `</div>`;

    return text;
}

function getNavigationLink(name, source, tag) {
    return [
        `<div onclick='fillPosts("`,
        source,
        `", "`,
        tag,
        `");'>`,
        name,
        `</div>`,
    ].join('');
}

function fillTags(navigation) {
    for (let i = 0; i < navigation.length; i++) {
        if (navigation[i].tag) {
            SECTION_TAG_TO_DATA_SOURCE[navigation[i].tag] = DB_PREFIX + navigation[i].source
        }

        if (navigation[i].inner.length > 0) {
            for (let j = 0; j < navigation[i].inner.length; j++) {
                if (navigation[i].inner[j].tag) {
                    SECTION_TAG_TO_DATA_SOURCE[navigation[i].inner[j].tag] = DB_PREFIX + navigation[i].inner[j].source
                }
            }
        }
    }
}

function getFormattedNavigation(navigation) {
    let text = "<ul>";

    for (let i = 0; i < navigation.length; i++) {
        text += "<li>";
        if (navigation[i].source.length > 0) {
            text += getNavigationLink(
                navigation[i].name,
                DB_PREFIX + navigation[i].source,
                navigation[i].tag
            );
        } else {
            text += navigation[i].name;
        }

        if (navigation[i].inner.length > 0) {
            text += "<ul>";
            for (let j = 0; j < navigation[i].inner.length; j++) {
                text += "<li>";
                text += getNavigationLink(
                    navigation[i].inner[j].name,
                    DB_PREFIX + navigation[i].inner[j].source,
                    navigation[i].inner[j].tag
                );
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

    fillTags(navigation.navigation)

    $(".top-menu").html(getFormattedNavigation(navigation.navigation));
}

async function fillPosts(source, tag) {
    posts = await fetchData(source);
    if (posts == null) {
        return
    }

    $(".content-wrapper").html(getFormattedPosts(posts.posts));

    $(".timeline-wrapper").html(getFormattedTimeline(posts.posts));

    if (tag) {
        var queryParams = new URLSearchParams();
        queryParams.set(PAGE_QUERY_PARAM, tag);
        history.replaceState(null, null, "?" + queryParams.toString());
    } else {
        history.replaceState(null, null, "?");
    }
}

function getSectionTag() {
    if (SECTION_TAG_TO_DATA_SOURCE.length == 0) {
        return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const pageTag = urlParams.get(PAGE_QUERY_PARAM);

    if (pageTag in SECTION_TAG_TO_DATA_SOURCE) {
        return pageTag;
    }

    return null;
}

async function fillMainData() {
    await fillNavigation();
    var currentSectionTag = getSectionTag()
    await fillPosts(currentSectionTag == null ? CURRENT_DB : SECTION_TAG_TO_DATA_SOURCE[currentSectionTag], currentSectionTag);
}

fillMainData();
