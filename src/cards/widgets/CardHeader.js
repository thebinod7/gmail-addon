export default function CardHeader({
	itemName = 'lorem ipsum',
	email = 'example@mail.com',
	imageUrl = 'https://source.unsplash.com/featured/320x180?nature&sig=8'
}) {
	return CardService.newCardHeader()
		.setTitle(itemName)
		.setSubtitle(email)
		.setImageUrl(imageUrl)
		.setImageStyle(CardService.ImageStyle.CIRCLE);
}
