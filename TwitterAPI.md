REST API: https://dev.twitter.com/rest/public
Search: https://support.twitter.com/articles/71577

https://github.com/ttezel/twit

https://www.npmjs.com/package/node-twitterbot
https://github.com/nkirby/node-twitterbot

https://github.com/istrategylabs/node-twitter for DM’s?

http://videlais.com/2014/12/16/creating-a-basic-twitter-bot-in-node-js/
http://markrabey.com/2014/05/09/build-a-twitter-bot-with-node-js/
http://imogenation.net/building-a-node-js-twitter-bot/ - Dec 2013


followUser { id: 2971754221,
  id_str: '2971754221',
  name: 'Davis Brown',
  screen_name: 'davisbrown562',
  location: 'Germany',
  description: '#Blogger, #ecommerce specialist, #WebDesign ,  #webdevelopment #css #html #WordPress #CMS Passionate about the web and user Interface  & Social Media Expert',
  url: 'http://t.co/ila94kzI40',
  entities: { url: { urls: [Object] }, description: { urls: [] } },
  protected: false,
  followers_count: 678,
  friends_count: 1188,
  listed_count: 446,
  created_at: 'Sat Jan 10 10:44:03 +0000 2015',
  favourites_count: 9961,
  utc_offset: 3600,
  time_zone: 'Berlin',
  geo_enabled: true,
  verified: false,
  statuses_count: 19841,
  lang: 'en',
  contributors_enabled: false,
  is_translator: false,
  is_translation_enabled: false,
  profile_background_color: '000000',
  profile_background_image_url: 'http://pbs.twimg.com/profile_background_images/623415318287896576/Ctv0SDCf.jpg',
  profile_background_image_url_https: 'https://pbs.twimg.com/profile_background_images/623415318287896576/Ctv0SDCf.jpg',
  profile_background_tile: true,
  profile_image_url: 'http://pbs.twimg.com/profile_images/623794521269145600/wv6nceUB_normal.jpg',
  profile_image_url_https: 'https://pbs.twimg.com/profile_images/623794521269145600/wv6nceUB_normal.jpg',
  profile_banner_url: 'https://pbs.twimg.com/profile_banners/2971754221/1433926611',
  profile_link_color: 'DD2E44',
  profile_sidebar_border_color: '000000',
  profile_sidebar_fill_color: '000000',
  profile_text_color: '000000',
  profile_use_background_image: true,
  has_extended_profile: false,
  default_profile: false,
  default_profile_image: false,
  following: false,
  follow_request_sent: false,
  notifications: false }

makeTweetFavorite { metadata: { iso_language_code: 'en', result_type: 'recent' },
  created_at: 'Thu Dec 03 10:52:05 +0000 2015',
  id: 672367695711588400,
  id_str: '672367695711588352',
  text: 'None @TymoorG I would recommend TemplateToaster https://t.co/ONre62LZaU . Better than Wix and faster than Squarespace',
  source: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
  truncated: false,
  in_reply_to_status_id: 672184947764019200,
  in_reply_to_status_id_str: '672184947764019200',
  in_reply_to_user_id: 556096616,
  in_reply_to_user_id_str: '556096616',
  in_reply_to_screen_name: 'TymoorG',
  user: 
   { id: 2971754221,
     id_str: '2971754221',
     name: 'Davis Brown',
     screen_name: 'davisbrown562',
     location: 'Germany',
     description: '#Blogger, #ecommerce specialist, #WebDesign ,  #webdevelopment #css #html #WordPress #CMS Passionate about the web and user Interface  & Social Media Expert',
     url: 'http://t.co/ila94kzI40',
     entities: { url: [Object], description: [Object] },
     protected: false,
     followers_count: 678,
     friends_count: 1188,
     listed_count: 446,
     created_at: 'Sat Jan 10 10:44:03 +0000 2015',
     favourites_count: 9961,
     utc_offset: 3600,
     time_zone: 'Berlin',
     geo_enabled: true,
     verified: false,
     statuses_count: 19841,
     lang: 'en',
     contributors_enabled: false,
     is_translator: false,
     is_translation_enabled: false,
     profile_background_color: '000000',
     profile_background_image_url: 'http://pbs.twimg.com/profile_background_images/623415318287896576/Ctv0SDCf.jpg',
     profile_background_image_url_https: 'https://pbs.twimg.com/profile_background_images/623415318287896576/Ctv0SDCf.jpg',
     profile_background_tile: true,
     profile_image_url: 'http://pbs.twimg.com/profile_images/623794521269145600/wv6nceUB_normal.jpg',
     profile_image_url_https: 'https://pbs.twimg.com/profile_images/623794521269145600/wv6nceUB_normal.jpg',
     profile_banner_url: 'https://pbs.twimg.com/profile_banners/2971754221/1433926611',
     profile_link_color: 'DD2E44',
     profile_sidebar_border_color: '000000',
     profile_sidebar_fill_color: '000000',
     profile_text_color: '000000',
     profile_use_background_image: true,
     has_extended_profile: false,
     default_profile: false,
     default_profile_image: false,
     following: false,
     follow_request_sent: false,
     notifications: false },
  geo: null,
  coordinates: null,
  place: 
   { id: 'fdcd221ac44fa326',
     url: 'https://api.twitter.com/1.1/geo/id/fdcd221ac44fa326.json',
     place_type: 'country',
     name: 'Germany',
     full_name: 'Germany',
     country_code: 'DE',
     country: 'Deutschland',
     contained_within: [],
     bounding_box: { type: 'Polygon', coordinates: [Object] },
     attributes: {} },
  contributors: null,
  is_quote_status: false,
  retweet_count: 0,
  favorite_count: 1,
  entities: 
   { hashtags: [],
     symbols: [],
     user_mentions: [ [Object] ],
     urls: [ [Object] ] },
  favorited: false,
  retweeted: false,
  possibly_sensitive: false,
  lang: 'en' }



Follow event:

	{
		event: 'follow',

		source: {
			id: 5723862,
			id_str: '5723862',
			name: 'Tom Söderlund',
			screen_name: 'tomsoderlund',
			location: 'Stockholm, Sweden',
			url: 'https://t.co/TlqJjPUMQo',
			description: 'CEO, @Weld_io: a web/app creation tool for non-techies (the 99.5%). Also: feminist, dad.',
			protected: false,
			followers_count: 1666,
			friends_count: 1740,
			listed_count: 120,
			created_at: 'Wed May 02 21:00:28 +0000 2007',
			favourites_count: 1715,
			utc_offset: 3600,
			time_zone: 'Stockholm',
			geo_enabled: true,
			verified: false,
			statuses_count: 3208,
			lang: 'en',
			contributors_enabled: false,
			is_translator: false,
			is_translation_enabled: false,
			profile_background_color: '677380',
			profile_background_image_url: 'http://pbs.twimg.com/profile_background_images/37849238/twitter_paulinaalskardig.png',
			profile_background_image_url_https: 'https://pbs.twimg.com/profile_background_images/37849238/twitter_paulinaalskardig.png',
			profile_background_tile: false,
			profile_image_url: 'http://pbs.twimg.com/profile_images/483239549125283840/U57tmhcE_normal.jpeg',
			profile_image_url_https: 'https://pbs.twimg.com/profile_images/483239549125283840/U57tmhcE_normal.jpeg',
			profile_banner_url: 'https://pbs.twimg.com/profile_banners/5723862/1389994129',
			profile_link_color: '46C8DB',
			profile_sidebar_border_color: 'A3957C',
			profile_sidebar_fill_color: 'D2C0A0',
			profile_text_color: '677380',
			profile_use_background_image: false,
			default_profile: false,
			default_profile_image: false,
			following: false,
			follow_request_sent: false,
			notifications: false
		},
		
		target: {
			id: 128335003,
			id_str: '128335003',
			name: 'Tweezilla',
			screen_name: 'tweezilla',
			location: 'My Evil Lair',
			url: null,
			description: 'Hungry!!!',
			protected: false,
			followers_count: 0,
			friends_count: 6,
			listed_count: 0,
			created_at: 'Wed Mar 31 20:41:11 +0000 2010',
			favourites_count: 1,
			utc_offset: -7200,
			time_zone: 'Mid-Atlantic',
			geo_enabled: false,
			verified: false,
			statuses_count: 13,
			lang: 'en',
			contributors_enabled: false,
			is_translator: false,
			is_translation_enabled: false,
			profile_background_color: '1A1322',
			profile_background_image_url: 'http://pbs.twimg.com/profile_background_images/87924792/cave_texture2.jpg',
			profile_background_image_url_https: 'https://pbs.twimg.com/profile_background_images/87924792/cave_texture2.jpg',
			profile_background_tile: true,
			profile_image_url: 'http://pbs.twimg.com/profile_images/788867178/TwitterMonster_normal.jpg',
			profile_image_url_https: 'https://pbs.twimg.com/profile_images/788867178/TwitterMonster_normal.jpg',
			profile_link_color: '65E100',
			profile_sidebar_border_color: '552861',
			profile_sidebar_fill_color: 'C386D4',
			profile_text_color: '333333',
			profile_use_background_image: true,
			default_profile: false,
			default_profile_image: false,
			following: false,
			follow_request_sent: false,
			notifications: false
		},
		created_at: 'Mon Oct 26 22:01:21 +0000 2015'
	}