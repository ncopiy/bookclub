const DB_PREFIX = document.location.origin.includes("localhost") ? "db/test/" : "db/prod/"
const CURRENT_DB = DB_PREFIX + "current.json";
const NAVIGATION_DB = DB_PREFIX + "navigation.json";

const PAGE_QUERY_PARAM = "page";

const RATING_TYPES = {
    'plot': 'Сюжет',
    'atmosphere': 'Aтмосфера',
    'characters': 'Персонажи',
    'total': 'Общая оценка'
};

var SECTION_TAG_TO_DATA_SOURCE = {};

function formatEndOfStrings(text) {
    return text.replaceAll('\n', '<br>');
}

function getFormattedPost(post) {
    let text = `
    <div class="post-block">
        <a id=${post.anchor}><h1>${post.title}</h1></a>
        <h2>${post.author}</h2>
    `;

    text += getPostPictures(post);

    text += `<p class="date">${post.ts_end}</p>`;
    text += `<p class="annotation">${formatEndOfStrings(post.annotation)}</p><br>`;

    for (let j = 0; j < post.quotes.length; j++) {
        text += `<blockquote>${formatEndOfStrings(post.quotes[j])}</blockquote>`;
    }

    text += getRatings(post.readers);

    text += `</div><br>`;

    return text;
}

function getPostPictures(post) {
    if (post.pics.length != 1) {
        return ``;
    }

    return `<p class="main-pic"><img src="${post.pics[0]}" class="book-cover"></p>`;
}

function getRatings(readers) {
    let text = ``;
    for (const ratingType in RATING_TYPES) {
        let count = 0;
        let total = 0;
        for (const name in readers) {
            if ('rating' in readers[name] && ratingType in readers[name]['rating']) {
                count++;
                total += readers[name]['rating'][ratingType];
            }
        }

        if (count > 0 && total > 0) {
            let average = total / count;
            let rounded = average * 10;

            text += `
            <div class="stars">
            <div class="stars-description">${RATING_TYPES[ratingType]}:</div>
            <div class="stars-empty" title="${average}/10">
                ☆☆☆☆☆
                <div class="stars-filled" style="width: ${rounded}%" title="${average}/10">
                    ★★★★★
                </div>
            </div>
        </div>`;
        }
    }
    return text
}

function getFormattedTimeline(posts) {
    if (posts.length < 2) {
        return ``;
    }

    let text = `<div class="timeline-wrapper"><div class="timeline">`;

    let step = 100 / (posts.length - 1);
    let percent = 0;

    for (let i = posts.length - 1; i >= 0; i--) {
        text += `
        <div class="timeline-unit" style="left:${percent}%;">
            <a href="#${posts[i].anchor}" title="${posts[i].author} - ${posts[i].title}">${posts[i].emoji}</a>
        </div>`;

        percent += step;
    }

    text += `</div></div>`;

    return text;
}


function getFormattedPosts(posts) {
    let text = `<div class="content-wrapper"><div class="posts">`;

    for (let i = 0; i < posts.length; i++) {
        text += getFormattedPost(posts[i]);
    }

    text += `</div></div>`;

    return text;
}

function getNavigationLink(name, source, tag) {
    if (tag.length == 0) {
        return `<a href="./"><div>${name}</div></a>`;
    }
    return `<a href="?page=${tag}"><div>${name}</div></a>`;
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

    let text = getFormattedTimeline(posts.posts);
    text += getFormattedPosts(posts.posts);

    $(".page-content").html(text);
}

function jumpToAnchor() {
    let anchorValue = (document.URL.split('#').length > 1) ? document.URL.split('#')[1] : "";
    if (anchorValue.length == 0) {
        return
    }
    let top = document.getElementById(anchorValue).offsetTop;
    window.scrollTo(0, top);
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
    let currentSectionTag = getSectionTag();
    await fillPosts(currentSectionTag == null ? CURRENT_DB : SECTION_TAG_TO_DATA_SOURCE[currentSectionTag], currentSectionTag);
    jumpToAnchor();
}

fillMainData();
