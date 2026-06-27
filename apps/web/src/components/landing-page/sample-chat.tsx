export const SampleChat = () => {
	return (
		<>
			<div className="overflow-hidden border-t p-6 md:border-0 dark:bg-transparent">
				<div aria-hidden className="flex flex-col gap-6">
					{[
						{
							sender: "user",
							message: "Hey, I'm having trouble with my account.",
						},
						{
							sender: "ai",
							message: "Hi there! I'm here to help you with your account.",
						},
						{
							sender: "user",
							message: "Thanks! I can't log in, it says my password is incorrect.",
						},
						{
							sender: "ai",
							message: "Please click on the 'Forgot Password' button",
						},
					].map((chat, idx) =>
						chat.sender === "user" ? (
							<div
								key={idx}
								className="flex items-start gap-2 justify-start">
								<div>
									<div className="rounded-lg bg-white dark:bg-gray-900 border p-3 text-xs max-w-xs">
										{chat.message}
									</div>
								</div>
							</div>
						) : (
							<div
								key={idx}
								className="flex items-center gap-2 justify-end">
								{/* <div className="size-6 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
                  <SparklesIcon className="text-muted-foreground" size={12} />
                </div> */}
								<div>
									<div className="rounded-lg bg-primary p-3 text-xs text-white max-w-xs ml-auto">
										{chat.message}
									</div>
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</>
	);
};
