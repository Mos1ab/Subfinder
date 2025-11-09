let btn, currentPage, previousPage;

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'tabUpdated') {
        currentPage = window.location.href.split('/')[4];
        (!btn || currentPage !== previousPage) && init();
    }
});

async function init() {
    const loadUserSettings = await new Promise((resolve) => {
        chrome.storage.sync.get('settings', (res) => {
            resolve(res);
        });
    });

    previousPage = currentPage;
    const settings = loadUserSettings.settings || { site_setting: 'subdl', omdb_api_key: '' };
    searchSubtitles(settings);
}

async function fetchIMDb(title, apiKey) {
    if (!apiKey) return null;
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`);
        const data = await response.json();
        return data.imdbID || null;
    } catch (e) {
        console.error('OMDb fetch failed', e);
        return null;
    }
}

function searchSubtitles(settings) {
    const domain = window.location.href;
    const media = window.location.pathname.includes('manga') ? 'manga' :
                  window.location.pathname.includes('movie') ? 'movie' :
                  window.location.pathname.includes('tv') ? 'tv' : 'anime';
    let titleJap, titleEng, btnSpace, cardType, cardFlag;
    let siteSetting = settings.site_setting;

    function createBtn(btnSpace) {
        !cardFlag && document.querySelector('.subFinderBtn') && document.querySelectorAll('.subFinderBtn').forEach((e) => e.remove()), (cardFlag = true);
        btn = btnSpace.appendChild(document.createElement('a'));
        btn.classList.add('subFinderBtn');
        btn.style.display = 'none'; // Hide by default until IMDB ID fetched
    }

async function createSearch(titleEng, titleJap) {
    let queries = [titleEng || titleJap, titleJap].filter(q => q).map(q => q.replace(/["]/g, ''));
    console.log('Searching for:', queries);
    console.log('API Key present:', !!settings.omdb_api_key);

    let imdbID = null;
    for (let query of queries) {
        imdbID = await fetchIMDb(query, settings.omdb_api_key);
        if (imdbID) break;
    }

    console.log('IMDb ID found:', imdbID);

    if (!imdbID) {
        console.log('No IMDb ID found, hiding button');
        return; // No IMDB ID found, keep button hidden
    }
    console.log('Showing button with IMDb ID:', imdbID);

    let searchUrl, siteText;

    if (siteSetting === 'subdl') {
        siteText = 'subdl';
        searchUrl = `https://subdl.com/search/${imdbID}`;
    } else if (siteSetting === 'subsource') {
        siteText = 'subsource';
        searchUrl = `https://subsource.net/search?q=${imdbID}`;
    }

    btn.textContent = `Search on ${siteText}`;
    btn.title = `Search Subtitles`;
    btn.href = searchUrl;
    btn.target = '_blank';
    btn.style.display = 'block'; // Show button only if IMDB ID found
}

    switch (true) {
        case domain.includes(`myanimelist.net`):
            const malMain = new RegExp(`myanimelist\\.net/(anime|manga)/\\d+`);
            if (malMain.test(domain)) {
                const engCheck = document.querySelector('.title-english');
                engCheck && (titleEng = engCheck.textContent);

                if (media === 'manga') {
                    const titleElm = document.querySelector('[itemprop="name"]');
                    titleJap = titleElm.textContent;
                    if (engCheck) {
                        engCheck.textContent = '';
                        titleJap = titleElm.textContent;
                        engCheck.textContent = titleEng;
                    }
                } else {
                    titleJap = document.querySelector('.title-name').textContent;
                }

                btnSpace = document.getElementById('broadcast-block') || document.querySelector('.leftside').children[0];
                createBtn(btnSpace);
                btn.style.marginTop = '4px';
                btn.classList.add('left-info-block-broadcast-button');
                createSearch(titleEng, titleJap);
            }

            const cardPaths = ['/genre', '/season', '/magazine', '/adapted'];
            if (cardPaths.some((path) => domain.includes(path))) {
                if (domain.includes('/adapted') && document.querySelector('.list.on')) return;

                for (const card of document.querySelectorAll('.seasonal-anime')) {
                    cardType = true;
                    titleJap = card.querySelector('.title h2').innerText;
                    titleEng = card.querySelector('.title h3')?.innerText;

                    createBtn(card.querySelector('.broadcast'));
                    btn.title = 'Search Subtitles';
                    btn.style.background = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiIvPjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiLz48L3N2Zz4=) center/20px no-repeat';
                    btn.style.padding = '0 11px';
                    createSearch(titleEng, titleJap);
                }
            }
            break;

        case domain.includes(`anime-planet.com/(anime|manga)/`) && domain !== `https://www.anime-planet.com/(anime|manga)/`:
            const skipPages = ['all', 'top-', 'recommendations', 'tags'];
            let skipExtra =
                media == 'anime' ? ['seasons', 'watch-online', 'studios'] : ['read-online', 'publishers', 'magazines', 'webtoons', 'light-novels'];

            if (skipPages.some((page) => domain.includes(`/${media}/${page}`)) || skipExtra.some((page) => domain.includes(`/${media}/${page}`))) {
                break;
            }

            setTimeout(() => {
                const titleMain = document.querySelector('[itemprop=name]').textContent;
                const titleAlt = document.getElementsByClassName('aka')[0];
                titleEng = titleMain;
                titleAlt ? (titleJap = titleAlt.innerText.split(': ').pop()) : (titleJap = titleMain);

                createBtn(document.querySelector('.mainEntry'));
                btn.classList.add('button');
                document.querySelectorAll('.mainEntry > .button').forEach((button) => {
                    typeof button === 'object' && (button.style.width = '180px');
                });
                createSearch(titleEng, titleJap);
            }, 50);
            break;

        case domain.includes(`animenewsnetwork.com/encyclopedia/(anime|manga).php?id=`):
            setTimeout(() => {
                titleEng = document.getElementById('page_header').innerText.split(' (').shift();
                for (const altTitle of document.querySelectorAll('#infotype-2 > .tab')) {
                    altTitle.textContent.includes('Japanese') && !titleJap && (titleJap = altTitle.textContent.split(' (').shift());
                }
                !titleJap && titleEng && (titleJap = titleEng);

                btnSpace = document.querySelector('.fright') ? document.querySelector('.fright') : document.querySelector('#big-video');
                createBtn(btnSpace);
                btn.style.display !== 'none' && (btn.style.display = 'flex');
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.height = '35px';
                btn.style.borderRadius = '3px';
                btn.style.background = '#2d50a7';
                btn.style.color = '#fff';
                btn.style.border = '1px solid black';
                btn.style.textDecoration = 'none';
                btnSpace.children[0].tagName === 'TABLE' && (btn.style.marginTop = '4px');
createSearch(titleEng, titleJap);
            }, 50);
            break;

        case domain.includes(`anidb.net/(anime|manga)/`):
            const hasID = /anidb\.net\/\w+\/(\d+)/;
            if (domain.match(hasID)) {
                titleJap = document.querySelector(".value > [itemprop='name']").textContent;
                titleEng = document.querySelector(".value > [itemprop='alternateName']").textContent;

                btnSpace = document.querySelector('.resources > .value .english').appendChild(document.createElement('div'));
                btnSpace.classList.add('icons');
                createBtn(btnSpace);
                btn.classList.add('i_icon');
                btn.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiIvPjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiLz48L3N2Zz4=')";
                btn.style.backgroundSize = 'contain';
                btn.title = 'Search Subtitles';
                createSearch(titleEng || titleJap);
            }
            break;

        case domain.includes(`anilist.co/(anime|manga)/`):
            awaitLoadOf('.sidebar .type', 'Romaji', () => {
                for (const data of document.getElementsByClassName('type')) {
                    const setTitle = data.parentNode.children[1].textContent;
                    data.textContent.includes('Romaji') && (titleJap = setTitle);
                    data.textContent.includes('English') && (titleEng = setTitle);
                }

                createBtn(document.querySelector('.cover-wrap-inner'));
                btn.style.display !== 'none' && (btn.style.display = 'flex');
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.height = '35px';
                btn.style.borderRadius = '3px';
                btn.style.marginBottom = '20px';
                btn.style.background = 'rgb(var(--color-blue))';
                btn.style.color = 'rgb(var(--color-white))';
                createSearch(titleEng || titleJap);
            });
            break;

        case domain.includes(`kitsu.app/(anime|manga)/`):
            awaitLoadOf('.media--information', 'Status', () => {
                let titleUsa;
                document.querySelector('a.more-link')?.click();
                for (const data of document.querySelectorAll('.media--information > ul > li')) {
                    const usaCheck = data.textContent.includes('English (American)');
                    const setTitle = data.getElementsByTagName('span')[0];
                    data.textContent.includes('Japanese (Romaji)') && (titleJap = setTitle.textContent);
                    data.textContent.includes('English') && !usaCheck && (titleEng = setTitle.textContent);
                    usaCheck && (titleUsa = setTitle.textContent);
                }
                document.querySelector('a.more-link')?.click();

                !titleEng && titleUsa && (titleEng = titleUsa);
                !titleJap && titleEng && (titleJap = titleEng);

                createBtn(document.querySelector('.library-state'));
                btn.classList.add('button', 'button--secondary');
                btn.style.background = '#f5725f';
                btn.style.marginTop = '10px';
                createSearch(titleEng || titleJap);
            });
            break;

        case domain.includes('livechart.me'):
            if (domain.includes(`livechart.me/(anime|tv)/`)) {
                titleJap = document.querySelector('.grow .text-xl').innerText;
                titleEng = document.querySelector('.grow .text-lg').innerText;

                createBtn(document.querySelector('.lc-poster-col'));
                btn.classList.add('lc-btn', 'lc-btn-sm', 'lc-btn-outline');
                createSearch(titleEng || titleJap);
            } else {
                let cardSelector, cardSpace;
                domain.includes('livechart.me/franchises/') ? (cardSelector = '.lc-anime') : (cardSelector = '.anime');
                domain.includes('livechart.me/franchises/') ? (cardSpace = '.lc-anime-card--related-links') : (cardSpace = '.related-links');

                for (const card of document.querySelectorAll(cardSelector)) {
                    cardType = true;
                    titleJap = card.getAttribute('data-romaji');
                    card.getAttribute('data-english') ? (titleEng = card.getAttribute('data-english')) : (titleEng = undefined);

                    createBtn(card.querySelector(cardSpace));
                    btn.style.background = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiIvPjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiLz48L3N2Zz4=) center/20px no-repeat';
                    btn.style.padding = '15px';
                    btn.style.margin = 0;
                    btn.classList.add('action-button');
                    btn.title = 'Search Subtitles';
                    createSearch(titleEng || titleJap);
                }
            }
            break;

        case domain.includes('imdb.com/title/'):
            setTimeout(() => {
                titleEng = document.querySelector('[data-testid="hero__primary-text"]')?.textContent ||
                          document.querySelector('h1')?.textContent;
                titleJap = titleEng; // IMDB doesn't typically have Japanese titles

                const heroSection = document.querySelector('[data-testid="hero-rating-bar__aggregate-rating"]')?.parentElement?.parentElement;
                if (heroSection) {
                    btnSpace = heroSection.appendChild(document.createElement('div'));
                    createBtn(btnSpace);
                    btn.style.marginTop = '10px';
                    btn.style.padding = '8px 16px';
                    btn.style.background = '#f5c518';
                    btn.style.color = '#000';
                    btn.style.borderRadius = '4px';
                    btn.style.textDecoration = 'none';
                    btn.style.fontWeight = 'bold';
                    btn.style.display = 'inline-block';
                    createSearch(titleEng || titleJap);
                }
            }, 500);
            break;

        case domain.includes('themoviedb.org/(movie|tv)/'):
            setTimeout(() => {
                titleEng = document.querySelector('.title h2 a')?.textContent ||
                          document.querySelector('.title h2')?.textContent;
                titleJap = titleEng;

                const actionsSection = document.querySelector('.header_info .actions');
                if (actionsSection) {
                    btnSpace = actionsSection.appendChild(document.createElement('div'));
                    createBtn(btnSpace);
                    btn.style.marginLeft = '10px';
                    btn.style.padding = '8px 16px';
                    btn.style.background = '#01b4e4';
                    btn.style.color = '#fff';
                    btn.style.borderRadius = '4px';
                    btn.style.textDecoration = 'none';
                    btn.style.fontWeight = 'bold';
                    createSearch(titleEng || titleJap);
                }
            }, 500);
            break;

        case domain.includes('thetvdb.com/(movies|series)/'):
            setTimeout(() => {
                titleEng = document.querySelector('h1')?.textContent;
                titleJap = titleEng;

                const headerActions = document.querySelector('.change_translation_text')?.parentElement;
                if (headerActions) {
                    btnSpace = headerActions.appendChild(document.createElement('div'));
                    createBtn(btnSpace);
                    btn.style.marginLeft = '10px';
                    btn.style.padding = '8px 16px';
                    btn.style.background = '#46b4b4';
                    btn.style.color = '#fff';
                    btn.style.borderRadius = '4px';
                    btn.style.textDecoration = 'none';
                    btn.style.fontWeight = 'bold';
                    createSearch(titleEng || titleJap);
                }
            }, 500);
            break;

        case domain.includes('trakt.tv/(movies|shows)/'):
            setTimeout(() => {
                titleEng = document.querySelector('.mobile-title')?.textContent ||
                          document.querySelector('h1')?.textContent;
                titleJap = titleEng;

                const infoSection = document.querySelector('.info');
                if (infoSection) {
                    btnSpace = infoSection.appendChild(document.createElement('div'));
                    createBtn(btnSpace);
                    btn.style.marginTop = '10px';
                    btn.style.padding = '8px 16px';
                    btn.style.background = '#ed1c24';
                    btn.style.color = '#fff';
                    btn.style.borderRadius = '4px';
                    btn.style.textDecoration = 'none';
                    btn.style.fontWeight = 'bold';
                    createSearch(titleEng || titleJap);
                }
            }, 500);
            break;
    }
}



const awaitLoadOf = (selector, text, func) => {
    return new Promise((resolve) => {
        const mutObs = new MutationObserver(() => {
            const elms = document.querySelectorAll(selector);
            elms.forEach((elm) => {
                if (elm.textContent.includes(text)) {
                    resolve(elm);
                    mutObs.disconnect();
                    func();
                }
            });
        });
        mutObs.observe(document.body, { childList: true, subtree: true });
    });
};
