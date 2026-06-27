const themes = [
	{
		name: "Dracula",
		textColor: "#F8F8F2",
		backgroundColor: "#242631",
		primaryColor: "#F477C5",
		secondaryColor: "#282A36",
	},
	{
		name: "Dark",
		textColor: "#A6ADBB",
		backgroundColor: "#242933",
		primaryColor: "#6D68E6",
		secondaryColor: "#2A303C",
	},
	{
		name: "Cymk",
		textColor: "#FFEC3A",
		backgroundColor: "#E9528C",
		primaryColor: "#44ADED",
		secondaryColor: "#1A1A1A",
	},
	{
		name: "Forest",
		textColor: "#D6CBCB",
		backgroundColor: "#151010",
		primaryColor: "#4AB855",
		secondaryColor: "#171212",
	},
	{
		name: "Coffee",
		textColor: "#756E63",
		backgroundColor: "#1D141C",
		primaryColor: "#DB924B",
		secondaryColor: "#20161F",
	},
	{
		name: "Lemonade",
		textColor: "#519903",
		backgroundColor: "#FFFFFF",
		primaryColor: "#333333",
		secondaryColor: "#E6E5E6",
	},
];

export const LandingThemes = () => {
	return (
		<>
			<div className="size-full w-100 pt-6 mask-[linear-gradient(black_70%,transparent)]">
				<div
					className="mx-3.5 flex origin-top scale-95 cursor-default flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000017]"
					aria-hidden>
					<div className="flex items-center justify-between">
						<h3 className="text-base font-sans font-medium">Themes</h3>
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-2 rounded-2xl auto-rows-max gap-4 max-w-lg md:gap-6 md:max-w-2xl lg:max-w-3xl p-4 mx-auto md:basis-3/5 w-full overflow-y-auto bg-white">
						{themes.slice(0, 6).map((theme) => (
							<div
								key={theme.name}
								className={
									"rounded-2xl overflow-hidden border-neutral-500 cursor-pointer relative z-0 duration-200 hover:scale-105"
								}>
								<div className="grid grid-cols-4 h-16 md:h-20">
									<div
										className="h-full"
										style={{
											background: theme.secondaryColor,
										}}
									/>
									<div
										className="h-full"
										style={{
											background: theme.backgroundColor,
										}}
									/>
									<div
										className="h-full"
										style={{
											background: theme.primaryColor,
										}}
									/>
									<div
										className="h-full"
										style={{ background: theme.textColor }}
									/>
								</div>
								<span
									style={{ color: theme.textColor }}
									className="absolute top-1.5 left-1.5 z-10 text-xs text-base-content/80">
									{theme.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
