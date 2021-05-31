import './styles.module.scss';
import Page from 'components/Page';
import { Perm } from 'modules/client/perms';
import { withErrorPage } from 'modules/client/errors';
import { withStatusCode } from 'modules/server/errors';
import { Form, Formik } from 'formik';
import { useCallback, useState } from 'react';
import { useLeaveConfirmation } from 'modules/client/forms';
import Box from 'components/Box';
import BoxFooter from 'components/Box/BoxFooter';
import Button from 'components/Button';
import { getPrivateStory, getStoryByUnsafeID } from 'modules/server/stories';
import type { PrivateStory } from 'modules/client/stories';
import { storyStatusNames } from 'modules/client/stories';
import BoxRowSection from 'components/Box/BoxRowSection';
import FieldBoxRow from 'components/Box/FieldBoxRow';
import BoxRow from 'components/Box/BoxRow';
import IconImage from 'components/IconImage';
import LabeledBoxRow from 'components/Box/LabeledBoxRow';
import UserField from 'components/UserField';
import type { PublicUser } from 'modules/client/users';
import { useUser } from 'modules/client/users';
import { useUserCache } from 'modules/client/UserCache';
import { uniqBy } from 'lodash';
import users, { getPublicUser } from 'modules/server/users';
import UserArrayField from 'components/UserField/UserArrayField';

const getValuesFromStory = (privateStory: PrivateStory) => ({
	created: privateStory.created,
	title: privateStory.title,
	status: privateStory.status.toString(),
	owner: privateStory.owner,
	editors: privateStory.editors,
	author: privateStory.author || {
		name: '',
		site: ''
	},
	description: privateStory.description,
	blurb: privateStory.blurb,
	icon: privateStory.icon,
	banner: privateStory.banner,
	style: privateStory.style,
	disableUserTheme: privateStory.disableUserTheme,
	script: privateStory.script,
	tags: privateStory.tags,
	commentsEnabled: privateStory.commentsEnabled
});

type Values = ReturnType<typeof getValuesFromStory>;

type ServerSideProps = {
	privateStory: PrivateStory,
	userCache: PublicUser[]
} | {
	statusCode: number
};

const Component = withErrorPage<ServerSideProps>(({
	privateStory: initialPrivateStory,
	userCache: initialUserCache
}) => {
	const [privateStory, setPrivateStory] = useState(initialPrivateStory);

	const { cacheUser } = useUserCache();
	initialUserCache.forEach(cacheUser);

	const user = useUser()!;

	const initialValues = getValuesFromStory(privateStory);

	const ownerPerm = (
		user.id === privateStory.owner
		|| user.perms & Perm.sudoWrite
	);

	return (
		<Page flashyTitle heading="Edit Adventure">
			<Formik
				initialValues={initialValues}
				onSubmit={
					useCallback(async (values: Values) => {

					}, [])
				}
				enableReinitialize
			>
				{({ isSubmitting, dirty, values }) => {
					useLeaveConfirmation(dirty);

					return (
						<Form>
							<Box>
								<BoxRowSection heading="Info">
									<FieldBoxRow
										name="title"
										label="Title"
										autoComplete="off"
										required
										maxLength={50}
									/>
									<FieldBoxRow
										as="select"
										name="status"
										label="Status"
										required
									>
										{Object.keys(storyStatusNames).map(status => (
											<option
												key={status}
												value={status}
											>
												{(storyStatusNames as any)[status]}
											</option>
										))}
									</FieldBoxRow>
									<LabeledBoxRow label="Owner">
										<UserField
											name="owner"
											required
											readOnly={!ownerPerm}
										/>
									</LabeledBoxRow>
									<LabeledBoxRow
										labelProps={{
											className: 'user-array-field-label'
										}}
										label="Editors"
										help={'The users with permission to edit this adventure.\n\nOnly the owner is allowed to delete the adventure, change its owner, or change its editors.'}
									>
										<UserArrayField
											name="editors"
											readOnly={!ownerPerm}
										/>
									</LabeledBoxRow>
									<FieldBoxRow
										type="url"
										name="icon"
										label="Icon URL"
									/>
									<BoxRow>
										<IconImage
											id="story-icon"
											src={values.icon}
											alt="Your Adventure's Icon"
											title="Your Adventure's Icon"
										/>
									</BoxRow>
								</BoxRowSection>
								<BoxFooter>
									<Button
										type="submit"
										className="alt"
										disabled={!dirty || isSubmitting}
									>
										Save
									</Button>
								</BoxFooter>
							</Box>
						</Form>
					);
				}}
			</Formik>
		</Page>
	);
});

export default Component;

export const getServerSideProps = withStatusCode<ServerSideProps>(async ({ req, params }) => {
	const story = await getStoryByUnsafeID(params.storyID);

	if (!(
		story && req.user && (
			story.owner.equals(req.user._id)
			|| story.editors.some(userID => userID.equals(req.user!._id))
			|| req.user.perms & Perm.sudoRead
		)
	)) {
		return { props: { statusCode: 403 } };
	}

	return {
		props: {
			privateStory: getPrivateStory(story),
			userCache: await users.find!({
				_id: {
					$in: uniqBy([story.owner, ...story.editors], String)
				}
			}).map(getPublicUser).toArray()
		}
	};
});