const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');

$(document).ready(() => {
    loadQueue();
});

audioPlayer.addEventListener('ended', playNextSong);

$(document).ready(function() {
    $('.search-button').click(function(event) {
        event.preventDefault(); 
        const query = $('#search-input').val();

        if (query.startsWith('.')) {
	    showPopup('Executing command...');
	    const chatContainer = $('#chat-container');
	    chatContainer.empty();

            $.ajax({
                url: '/',
                type: 'POST',
                contentType: 'application/json', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ query: query }),
                success: function(response) {
                    if (response.status == 'success') {
			    if (response.type == 'play') {
				    appendQueue(response);
				    showPopup('Song added to queue.', 3000);
			    } else {
				    audioSource.src = '';
				    audioPlayer.load();
				    loadQueue();
				    showPopup('Command executed.', 3000);
			    }
                    } else {
			    showPopup('Command failed.', 3000);
		    }
                },
            });
        } else {
            loadResults(query);
        }
    });

    $(document).on('click', '.add-song', function(event) {
        event.preventDefault();
        const songUrl = $(this).data('url');
	showPopup('Adding song to queue...');

        $.ajax({
            url: '/',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ query: `.play ${songUrl}` }),
            success: function(response) {
		    appendQueue(response);
		    showPopup('Song added to queue.', 3000);
            },
        });
    });
});

function appendQueue(track) {
    const queueElement = $('#song-queue');
    const songItem = $('<li>');
    const anchorTag = $('<a>').attr('href', '#').text(track.name);
    songItem.append(anchorTag);
    songItem.addClass('song');
    songItem.data('songid', track.id);
    queueElement.append(songItem);
}


function loadResults(query) {
    const chatContainer = $('#chat-container');
    chatContainer.empty();
    const searchingMessage = $('<div>').addClass('chatBlock').text('Searching...');
    chatContainer.append(searchingMessage);
    $.get(`/get_results?query=${query}`, function(results) {

        searchingMessage.remove();
        for (const result of results) {
	    const ResultDiv = $('<div>').addClass('result');
	    const thumbnailDiv = $('<div>').addClass('thumbnail');
	    const thumbnail = result.thumbnail.replace(/^"(.+(?="$))"$/, '$1');
	    const img= $('<img>').attr('src', thumbnail);
	    img.css({
		    width: '100%',
		    height: 'auto'
            });
            thumbnailDiv.append(img);
            const chatBlock = $('<div>').addClass('chatBlock');
	    chatBlock.text(result.title);
	    const addSongButton = $('<button>').addClass('add-song').text('Add Song');
	    addSongButton.data('url', result.url);
	    ResultDiv.append(thumbnailDiv, chatBlock, addSongButton);
	    chatContainer.append(ResultDiv);
		
        }
    });
}

function playNextSong() {
    const CurrentSong = $('.song a.now-playing').parent();
    const SongId = CurrentSong.data('songid');
    $('.song a.now-playing').removeClass('now-playing');
    const nextSong = CurrentSong.next();
    if (nextSong.length > 0) {
        const nextPlaying = nextSong.find('a');
        nextPlaying.addClass('now-playing');
        $.get(`/get_song/${SongId + 1}`, function(response) {
            const base = '/static/';
            audioSource.src = base + response.url;
            audioPlayer.load(); 
            audioPlayer.play();                     
        });
    } else {
	
	const firstSong = $('#song-queue li:first-child');
        const firstPlaying = firstSong.find('a');
        firstPlaying.addClass('now-playing');
	$.get('/get_song/1', function(response) {
	    const base = '/static/';
	    audioSource.src = base + response.url;
	    audioPlayer.load(); 
	});
    }
}

function loadQueue() {
	const queueElement = $('#song-queue');
        queueElement.find('.song').remove();
        $.get('/get_queue', function(queue) {
            if (queue.length > 0) {
                const queueElement = $('#song-queue');
		queue.forEach(track => {
                const songItem = $('<li>');
		const anchorTag = $('<a>').attr('href', '#').text(track.name);
		songItem.append(anchorTag);
		songItem.addClass('song');
		songItem.data('songid', track.id);
                queueElement.append(songItem);

                });
		$('.song a.now-playing').removeClass('now-playing');
		const firstSong = $('#song-queue li:first-child');
		const firstPlaying = firstSong.find('a');
		firstPlaying.addClass('now-playing');
		$.get('/get_song/1', function(response) {
			const base = '/static/';
			audioSource.src = base + response.url;
			audioPlayer.load(); 
		});

            } else {
                console.log('Empty queue.');
            }
        
        });
    }

$('#song-queue').on('click', '.song a', function(event) {
    event.preventDefault(); 
    const trackId = $(this).parent().data('songid');
    $('.song a').removeClass('now-playing');
    $(this).addClass('now-playing');
    $.get(`/get_song/${trackId}`, function(response) {
	const base = '/static/'
	audioSource.src = base + response.url;
        audioPlayer.load(); 
        audioPlayer.play();
    });
});

function showPopup(message, time) {
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popupText");

    popupText.innerText = message;
    popup.style.display = "block";

    if (time) {
        setTimeout(function() {
            popup.style.display = "none";
        }, time);
    }
}

