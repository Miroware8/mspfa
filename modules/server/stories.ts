import db from 'modules/server/db';
import type { Quirk } from 'modules/client/quirks';
import type { URLString } from 'modules/types';
import type { PrivateStory, PublicStory } from 'modules/client/stories';
import { StoryStatus } from 'modules/client/stories';
import type { UserDocument, UserID } from 'modules/server/users';
import users from 'modules/server/users';
import type { APIResponse } from 'modules/server/api';

/** @minimum 1 */
export type StoryID = number;

/**
 * @minLength 1
 * @pattern ^[a-z0-9-]+$
 */
export type TagString = string;

export type StoryPage = {
	published: Date,
	title: string,
	content: string,
	nextPages: number[],
	/** @uniqueItems */
	tags: TagString[],
	hidden: boolean,
	commentary: string,
	comments: StoryComment[]
};

export type StoryPageDraft = StoryPage & {
	notify: boolean
};

export type StoryComment = {
	posted: Date,
	edited?: Date,
	author: UserID,
	/** @minLength 1 */
	content: string,
	/** @uniqueItems */
	likes: UserID[],
	/** @uniqueItems */
	dislikes: UserID[],
	private: boolean
};

export type StoryColor = {
	value: string,
	name: string
};

export type StoryDocument = {
	_id: StoryID,
	created: Date,
	updated: Date,
	/**
	 * @minLength 1
	 * @maxLength 50
	 */
	title: string,
	status: StoryStatus,
	owner: UserID,
	/** @uniqueItems true */
	editors: UserID[],
	author?: {
		name: string,
		site: '' | URLString
	},
	pages: StoryPage[],
	drafts: StoryPageDraft[],
	/** @maxLength 2000 */
	description: string,
	/** @maxLength 500 */
	blurb: string,
	icon: '' | URLString,
	favCount: number,
	banner: '' | URLString,
	style: string,
	/** Whether the story should ignore the reader's theme setting. */
	disableUserTheme: boolean,
	script: {
		unverified: string,
		verified: string
	},
	/** @uniqueItems true */
	tags: TagString[],
	commentsEnabled: boolean,
	/** Properties of the story which are only used in the story editor. */
	editorSettings: {
		defaultPageTitle: StoryPage['title'],
		defaultSpoiler: {
			open: string,
			close: string
		}
	},
	colors: StoryColor[],
	quirks: Quirk[]
};

/** A `Partial<StoryDocument>` used to spread some general properties on newly inserted `StoryDocument`s. */
export const defaultStory = {
	status: StoryStatus.Ongoing,
	pages: [] as never[],
	drafts: [] as never[],
	description: '',
	blurb: '',
	icon: '',
	favCount: 0,
	banner: '',
	style: '',
	disableUserTheme: false,
	script: {
		unverified: '',
		verified: ''
	},
	tags: [] as never[],
	commentsEnabled: true,
	editorSettings: {
		defaultPageTitle: 'Next.',
		defaultSpoiler: {
			open: '',
			close: ''
		}
	},
	colors: [] as never[],
	quirks: [] as never[]
} as const;

// This is just for type safety on `defaultStory`.
const typeCheckedDefaultUser: Partial<StoryDocument> = defaultStory;
typeCheckedDefaultUser;

/** Converts a `StoryDocument` to a `PrivateStory`. */
export const getPrivateStory = (story: StoryDocument): PrivateStory => ({
	id: story._id,
	created: +story.created,
	updated: +story.updated,
	title: story.title,
	status: story.status,
	owner: story.owner.toString(),
	editors: story.editors.map(String),
	...story.author && {
		author: story.author
	},
	description: story.description,
	blurb: story.blurb,
	icon: story.icon,
	favCount: story.favCount,
	pageCount: story.pages.length,
	banner: story.banner,
	style: story.style,
	disableUserTheme: story.disableUserTheme,
	script: story.script,
	tags: story.tags,
	commentsEnabled: story.commentsEnabled,
	editorSettings: story.editorSettings,
	colors: story.colors,
	quirks: story.quirks
});

/** Converts a `StoryDocument` to a `PublicStory`. */
export const getPublicStory = (story: StoryDocument): PublicStory => ({
	id: story._id,
	created: +story.created,
	updated: +story.updated,
	title: story.title,
	status: story.status,
	owner: story.owner.toString(),
	editors: story.editors.map(String),
	...story.author && {
		author: story.author
	},
	description: story.description,
	blurb: story.blurb,
	icon: story.icon,
	favCount: story.favCount,
	pageCount: story.pages.length,
	style: story.style,
	disableUserTheme: story.disableUserTheme,
	script: story.script,
	tags: story.tags,
	commentsEnabled: story.commentsEnabled,
	colors: story.colors,
	quirks: story.quirks
});

const stories = db.collection<StoryDocument>('stories');

export default stories;

export const getPublicStoriesByEditor = async (editor: UserDocument) => (
	stories.find!({
		editors: editor._id
	}).map(getPublicStory).toArray()
);

/** Updates the specified story's `favCount`. Sends the new `{ favCount }` as an API response. */
export const updateAndSendFavCount = async (
	res: APIResponse<{
		body: {
			favCount: StoryDocument['favCount']
		}
	}>,
	storyID: StoryID
) => {
	const favCount = (
		await users.aggregate!([
			{ $match: { favs: storyID } },
			{ $count: 'favCount' }
		]).next() as { favCount: number } | null
	)?.favCount || 0;

	await stories.updateOne({
		_id: storyID
	}, {
		$set: { favCount }
	});

	res.send({ favCount });
};