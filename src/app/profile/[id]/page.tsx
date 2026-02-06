import ProfileClient from './ProfileClient'

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    return <ProfileClient id={params.id} />
}
