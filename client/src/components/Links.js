import React, { Component } from 'react';
import './css/Links.css';

class Links extends Component {
    state = {
        serverMsg: '',
        success: false,
        showLinksCount: 0,
        viewMoreLinks: false,
        linksList: [],
        filter: '',
    }
    
    componentDidMount = async () => {
        await this.fetchLinks('latest');
        
        const links = document.getElementsByClassName('Links')[0];
        links.addEventListener('wheel', this.loadMoreLinks);
    }    

    fetchLinks = async (activeFilter) => {
        try {
            await this.setFilterAndLinkCount(activeFilter);
            const getLinks = await fetch('api/getlinks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    filter: this.state.filter,
                    showLinksCount: this.state.showLinksCount,
                    token: window.localStorage.getItem('token')
                })
            });
            const res = await getLinks.json();
            await this.fetchLinksResponse(res, activeFilter);
            this.setFontAndSize(this.state.showLinksCount);
            this.setState({viewMoreLinks: false});
        } catch(err) {
            console.log(err);
            this.setState({serverMsg: 'Something went wrong!'});
        }
    }

    setFilterAndLinkCount = (activeFilter) => {
        if(activeFilter === 'viewMore') {
            const serverShowLimit = 30;
            this.setState({
                showLinksCount: this.state.showLinksCount + serverShowLimit
            });
        } else {
            this.setState({
                showLinksCount: 0,
                filter: activeFilter
            });
            const links = document.getElementsByClassName('Links')[0];
            links.scrollLeft = 0;
        }
    }

    fetchLinksResponse = (res, activeFilter) => {
        if(res.status === 'success') {
            const newLinksList = this.addRatingToLinks(res.links, res.userRatedLinks);
            if(activeFilter === 'viewMore') {
                this.setState(prevState => ({
                    success: true,
                    linksList: [...prevState.linksList, ...newLinksList]
                }));
            } else {
                this.setState({
                    success: true,
                    linksList: newLinksList
                });
            }
        } else {
            this.setState({
                serverMsg: res.status,
                success: false
            });
        }
    }

    addRatingToLinks = (links, userRatedLinks) => {
        if(userRatedLinks !== undefined) {
            for(let i = 0, iLen = links.length; i < iLen; i++) {
                for(let j = 0, jLen = userRatedLinks.length; j < jLen; j++) {
                    if(links[i]._id === userRatedLinks[j].linkId) {
                        links[i].rating = userRatedLinks[j].rating;
                    }
                }
                if(links[i].rating === undefined) {
                    links[i].rating = 'none';
                }
            }
        }
        return links;
    }

    rateLink = async (newRating, currentRating, linkId) => {
        try {
            const getLinks = await fetch('api/ratelink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    newRating,
                    currentRating,
                    linkId,
                    token: window.localStorage.getItem('token')
                })
            });
            const res = await getLinks.json();
            this.rateLinkResponse(res, newRating);
        } catch(err) {
            console.log(err);
            this.setState({serverMsg: 'Something went wrong!'});
        }
    }

    rateLinkResponse = (res, newRating) => {
        if(res.status === 'success') {
            window.localStorage.setItem('token', res.token);
            const newLinksList = this.state.linksList.map(link => {
                if(link._id === res.newLink._id) {
                    if(res.linkStatus === 'removed') {
                        res.newLink.rating = 'none';
                    } else {
                        res.newLink.rating = newRating;
                    }
                    return res.newLink;
                }
                return link;
            });
            this.setState({linksList : newLinksList});
        } else {
            this.setState({
                serverMsg: res.status,
                success: false
            });
        }
    }

    setFontAndSize = (num) => {
        const closedLinkContainer = document.querySelectorAll('.closedLinkContainer'),
        fontArray = ['Germania One','Margarine','Saira Extra Condensed','Baloo Chettan','Open Sans Condensed','Lora','Lilita One','Indie Flower','Lobster','Pacifico'];
        for(let i = num, len = closedLinkContainer.length; i < len; i++) {
            const randomFont = Math.floor((Math.random() * fontArray.length)),
            randomFontSize = Math.floor((Math.random() * 75) + 25);
            const description = closedLinkContainer[i].getElementsByClassName('description')[0];
            description.style.fontFamily = fontArray[randomFont];
            description.style.fontSize = `${randomFontSize}px`;
        }
    }

    openLink = (e) => {
        const links = document.getElementsByClassName('Links')[0],
        closedLink = e.currentTarget,
        openedLink = e.target;


        if(closedLink.classList.contains('closedLinkContainer')) {
            closedLink.classList.add('pulledOutLink');

            const openedLinkContainer = closedLink.nextElementSibling;
            openedLinkContainer.classList.remove('hide');
            openedLinkContainer.classList.add('show');
            openedLinkContainer.style.display = 'block';

            links.removeEventListener('wheel', this.loadMoreLinks);
        } else if(openedLink.classList.contains('openedLinkContainer')) {
            const closedLinkContainer = openedLink.previousElementSibling;
            closedLinkContainer.classList.remove('pulledOutLink');
            
            openedLink.classList.remove('show');
            openedLink.classList.add('hide');

            setTimeout(function() {
                openedLink.style.display = 'none';
            }, 1000);

            links.addEventListener('wheel', this.loadMoreLinks);
        }
    }

    loadMoreLinks = (e) => {
        if(e.constructor.name === 'WheelEvent') {
            e.currentTarget.scrollLeft -= -e.deltaY / 2;
        }
        const links = e.currentTarget;
        if(links.scrollLeft > links.scrollWidth - links.clientWidth - 100) {
            if(!this.state.viewMoreLinks) {
                this.setState({viewMoreLinks: true});
                this.fetchLinks('viewMore');
            }
        }
    }

    clickedLink = (link) => {
        window.open(link, '_blank');
    }

    tiltAnimation = (e) => {
        const openedLinkContainer = e.currentTarget,
        container = e.currentTarget.childNodes[0],
        posX = (e.clientX - (openedLinkContainer.clientWidth / 2)) / 40,
        posY = ((openedLinkContainer.clientHeight / 2) - e.clientY) / 20;

        container.style.transform = `rotateY(${posX}deg) rotateX(${posY}deg) translate(-50%, -50%)`;
    }

    render() {
        return (
            <div className="Links" onScroll={this.loadMoreLinks}>
                <p className={`message ${this.state.success ? 'success' : ''}`}>{this.state.serverMsg}</p>

                <div className="allLinksContainer">
                    {this.state.linksList.map(link => {
                        return (
                            <div key={link._id} className="linkContainer">
                                <div className="closedLinkContainer" onClick={this.openLink}>
                                    <div className="container">
                                        <p className="description">{link.description}</p>
                                    </div>
                                </div>
                                <div className="openedLinkContainer" onClick={this.openLink} onMouseMove={this.tiltAnimation}>
                                    <div className="container">
                                        <p className="link" onClick={() => {this.clickedLink(link.link)}}>{link.link}</p>
                                        <p className="description">{link.description}</p>
                                        
                                        <p className="posted">Added by: {link.firstname} {link.lastname} {link.posted.split('T')[0]}</p>
                                        <div className="rateContainer">
                                            <div className={link.rating === 'like' ? 'rated' : ''} onClick={() => {this.rateLink('like', link.rating, link._id)}}>
                                                <svg version="1.1" className="navIcon" x="0px" y="0px" viewBox="0 0 485.5 485.5" width="25" height="25" xmlSpace="preserve">
                                                    <g>
                                                        <g>
                                                            <path d="M457.575,325.1c9.8-12.5,14.5-25.9,13.9-39.7c-0.6-15.2-7.4-27.1-13-34.4c6.5-16.2,9-41.7-12.7-61.5
                                                                c-15.9-14.5-42.9-21-80.3-19.2c-26.3,1.2-48.3,6.1-49.2,6.3h-0.1c-5,0.9-10.3,2-15.7,3.2c-0.4-6.4,0.7-22.3,12.5-58.1
                                                                c14-42.6,13.2-75.2-2.6-97c-16.6-22.9-43.1-24.7-50.9-24.7c-7.5,0-14.4,3.1-19.3,8.8c-11.1,12.9-9.8,36.7-8.4,47.7
                                                                c-13.2,35.4-50.2,122.2-81.5,146.3c-0.6,0.4-1.1,0.9-1.6,1.4c-9.2,9.7-15.4,20.2-19.6,29.4c-5.9-3.2-12.6-5-19.8-5h-61
                                                                c-23,0-41.6,18.7-41.6,41.6v162.5c0,23,18.7,41.6,41.6,41.6h61c8.9,0,17.2-2.8,24-7.6l23.5,2.8c3.6,0.5,67.6,8.6,133.3,7.3
                                                                c11.9,0.9,23.1,1.4,33.5,1.4c17.9,0,33.5-1.4,46.5-4.2c30.6-6.5,51.5-19.5,62.1-38.6c8.1-14.6,8.1-29.1,6.8-38.3
                                                                c19.9-18,23.4-37.9,22.7-51.9C461.275,337.1,459.475,330.2,457.575,325.1z M48.275,447.3c-8.1,0-14.6-6.6-14.6-14.6V270.1
                                                                c0-8.1,6.6-14.6,14.6-14.6h61c8.1,0,14.6,6.6,14.6,14.6v162.5c0,8.1-6.6,14.6-14.6,14.6h-61V447.3z M431.975,313.4
                                                                c-4.2,4.4-5,11.1-1.8,16.3c0,0.1,4.1,7.1,4.6,16.7c0.7,13.1-5.6,24.7-18.8,34.6c-4.7,3.6-6.6,9.8-4.6,15.4c0,0.1,4.3,13.3-2.7,25.8
                                                                c-6.7,12-21.6,20.6-44.2,25.4c-18.1,3.9-42.7,4.6-72.9,2.2c-0.4,0-0.9,0-1.4,0c-64.3,1.4-129.3-7-130-7.1h-0.1l-10.1-1.2
                                                                c0.6-2.8,0.9-5.8,0.9-8.8V270.1c0-4.3-0.7-8.5-1.9-12.4c1.8-6.7,6.8-21.6,18.6-34.3c44.9-35.6,88.8-155.7,90.7-160.9
                                                                c0.8-2.1,1-4.4,0.6-6.7c-1.7-11.2-1.1-24.9,1.3-29c5.3,0.1,19.6,1.6,28.2,13.5c10.2,14.1,9.8,39.3-1.2,72.7
                                                                c-16.8,50.9-18.2,77.7-4.9,89.5c6.6,5.9,15.4,6.2,21.8,3.9c6.1-1.4,11.9-2.6,17.4-3.5c0.4-0.1,0.9-0.2,1.3-0.3
                                                                c30.7-6.7,85.7-10.8,104.8,6.6c16.2,14.8,4.7,34.4,3.4,36.5c-3.7,5.6-2.6,12.9,2.4,17.4c0.1,0.1,10.6,10,11.1,23.3
                                                                C444.875,295.3,440.675,304.4,431.975,313.4z"/>
                                                        </g>
                                                    </g>
                                                </svg>
                                                <p>{link.like}</p>
                                            </div>
                                            <div className={link.rating === 'dislike' ? 'rated' : ''} onClick={() => {this.rateLink('dislike', link.rating, link._id)}}>
                                                <svg version="1.1" className="navIcon" x="0px" y="0px" viewBox="0 0 485.5 485.5" width="25" height="25" xmlSpace="preserve">
                                                    <g>
                                                        <g>
                                                            <path d="M457.525,153.074c1.9-5.1,3.7-12,4.2-20c0.7-14.1-2.8-33.9-22.7-51.9c1.3-9.2,1.3-23.8-6.8-38.3
                                                                c-10.7-19.2-31.6-32.2-62.2-38.7c-20.5-4.4-47.4-5.3-80-2.8c-65.7-1.3-129.7,6.8-133.3,7.3l-23.5,2.8c-6.8-4.8-15.1-7.6-24-7.6h-61
                                                                c-23,0-41.6,18.7-41.6,41.6v162.5c0,23,18.7,41.6,41.6,41.6h61c7.2,0,13.9-1.8,19.8-5c4.2,9.2,10.4,19.7,19.6,29.4
                                                                c0.5,0.5,1,1,1.6,1.4c31.4,24.1,68.4,110.9,81.5,146.3c-1.3,11-2.6,34.8,8.4,47.7c4.9,5.7,11.7,8.8,19.3,8.8
                                                                c7.7,0,34.3-1.8,50.9-24.7c15.7-21.8,16.6-54.4,2.6-97c-11.8-35.8-12.9-51.7-12.5-58.1c5.4,1.2,10.7,2.3,15.8,3.2h0.1
                                                                c0.9,0.2,22.9,5.1,49.2,6.3c37.4,1.8,64.5-4.7,80.3-19.2c21.8-19.9,19.2-45.3,12.7-61.5c5.6-7.3,12.4-19.2,13-34.4
                                                                C471.925,178.974,467.325,165.674,457.525,153.074z M109.225,222.674h-61c-8.1,0-14.6-6.6-14.6-14.6v-162.5
                                                                c0-8.1,6.6-14.6,14.6-14.6h61c8.1,0,14.6,6.6,14.6,14.6v162.5C123.825,216.174,117.325,222.674,109.225,222.674z M430.925,232.374
                                                                c0,0.1,3.5,5.6,4.7,13.1c1.5,9.3-1.1,17-8.1,23.4c-19.1,17.4-74.1,13.4-104.8,6.6c-0.4-0.1-0.8-0.2-1.3-0.3
                                                                c-5.5-1-11.4-2.2-17.4-3.5c-6.4-2.3-15.2-2-21.8,3.9c-13.3,11.8-11.8,38.6,4.9,89.5c11,33.4,11.4,58.6,1.2,72.7
                                                                c-8.6,11.9-22.8,13.4-28.2,13.5c-2.4-4-3.1-17.7-1.3-29c0.3-2.2,0.1-4.5-0.6-6.7c-1.9-5.1-45.8-125.3-90.7-160.9
                                                                c-11.7-12.7-16.8-27.6-18.6-34.3c1.2-3.9,1.9-8.1,1.9-12.4v-162.4c0-3-0.3-6-0.9-8.8l10.1-1.2h0.1c0.6-0.1,65.7-8.5,130-7.1
                                                                c0.4,0,0.9,0,1.4,0c30.3-2.4,54.8-1.7,72.9,2.2c22.4,4.8,37.2,13.2,44,25.1c7.1,12.3,3.2,25,2.9,26.2c-2.1,5.6-0.2,11.7,4.6,15.3
                                                                c29.6,22.2,16,48.1,14.2,51.3c-3.3,5.2-2.5,11.8,1.8,16.3c8.6,9,12.8,18,12.5,26.8c-0.4,13.1-10.5,22.9-11.2,23.5
                                                                C428.225,219.474,427.325,226.774,430.925,232.374z"/>
                                                        </g>
                                                    </g>
                                                </svg>
                                                <p>{link.dislike}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="filterContainer">
                    <p className={this.state.filter === 'latest' ? 'active': ''} onClick={() => {this.fetchLinks('latest')}}>Latest</p>
                    <p className={this.state.filter === 'oldest' ? 'active': ''} onClick={() => {this.fetchLinks('oldest')}}>Oldest</p>
                    <p className={this.state.filter === 'like' ? 'active': ''} onClick={() => {this.fetchLinks('like')}}>Likes</p>
                    <p className={this.state.filter === 'dislike' ? 'active': ''} onClick={() => {this.fetchLinks('dislike')}}>DisLikes</p>
                </div>
            </div>
        );
    }
}

export default Links;