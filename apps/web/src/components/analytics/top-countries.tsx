import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandIcon } from "lucide-react";
import { useState } from "react";
import BarList from "./bar-list";
import { Africa, Asia, Europe, NorthAmerica, Oceania, SouthAmerica } from "../continents";
import { ViewAllStats } from "./view-stats";

export function TopCountries() {
	const [countriesDialogOpen, setCountriesDialogOpen] = useState(false);
	const [citiesDialogOpen, setCitiesDialogOpen] = useState(false);
	const [continentsDialogOpen, setContinentsDialogOpen] = useState(false);

	const mapCountries = [
		{
			icon: <img src="https://flag.vercel.app/m/US.svg" className="w-4" alt="US" />,
			title: "United States",
			value: 450,
			href: "",
			linkId: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/GB.svg" className="w-4" alt="GB" />,
			title: "United Kingdom",
			value: 320,
			href: "",
			linkId: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/DE.svg" className="w-4" alt="DE" />,
			title: "Germany",
			value: 210,
			href: "",
			linkId: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/FR.svg" className="w-4" alt="FR" />,
			title: "France",
			value: 180,
			href: "",
			linkId: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/IN.svg" className="w-4" alt="IN" />,
			title: "India",
			value: 150,
			href: "",
			linkId: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/CA.svg" className="w-4" alt="CA" />,
			title: "Canada",
			value: 120,
			href: "",
			linkId: "",
		},
	];

	const mapCities = [
		{
			icon: (
				<img
					src="https://flag.vercel.app/m/US.svg"
					className="w-4"
					alt="New York"
				/>
			),
			title: "New York",
			value: 240,
			href: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/GB.svg" className="w-4" alt="London" />,
			title: "London",
			value: 190,
			href: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/DE.svg" className="w-4" alt="Berlin" />,
			title: "Berlin",
			value: 130,
			href: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/FR.svg" className="w-4" alt="Paris" />,
			title: "Paris",
			value: 110,
			href: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/JP.svg" className="w-4" alt="Tokyo" />,
			title: "Tokyo",
			value: 95,
			href: "",
		},
		{
			icon: <img src="https://flag.vercel.app/m/AE.svg" className="w-4" alt="Dubai" />,
			title: "Dubai",
			value: 80,
			href: "",
		},
	];

	const mapContinents = [
		{
			icon: <NorthAmerica className="w-4" />,
			title: "North America",
			value: 650,
			href: "",
		},
		{ icon: <Europe className="w-4" />, title: "Europe", value: 580, href: "" },
		{ icon: <Asia className="w-4" />, title: "Asia", value: 420, href: "" },
		{ icon: <Africa className="w-4" />, title: "Africa", value: 150, href: "" },
		{ icon: <SouthAmerica className="w-4" />, title: "South America", value: 90, href: "" },
		{ icon: <Oceania className="w-4" />, title: "Oceania", value: 45, href: "" },
	];

	const topCountries = mapCountries.slice(0, 5);
	const topCities = mapCities.slice(0, 5);
	const topContinents = mapContinents.slice(0, 5);

	const maxCountryCount = Math.max(...mapCountries.map((c) => c.value));
	const maxCityCount = Math.max(...mapCities.map((c) => c.value));
	const maxContinentCount = Math.max(...mapContinents.map((c) => c.value));

	return (
		<div className="h-87.5 w-full z-0 rounded-xl border bg-white flex flex-col overflow-hidden">
			<Tabs defaultValue="countries" className="flex flex-col h-full">
				<div className="flex items-center justify-between px-4 py-3 shrink-0">
					<TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
						<TabsTrigger
							value="countries"
							className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent">
							Countries
						</TabsTrigger>
						<TabsTrigger
							value="cities"
							className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent">
							Cities
						</TabsTrigger>
						<TabsTrigger
							value="continents"
							className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent">
							Continents
						</TabsTrigger>
					</TabsList>
					{/* <div className="flex items-center gap-1">
						<div className="text-muted-foreground text-sm flex items-center gap-1">
							<MousePointerClick className="h-4 w-4" /> Location
						</div>
					</div> */}
				</div>

				<div className="flex-1 min-h-0 overflow-hidden">
					<TabsContent value="countries" className="h-full m-0 p-0">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
								<BarList
									tab="Countries"
									unit="visits"
									data={topCountries}
									barBackground="bg-green-200"
									hoverBackground="hover:bg-green-50"
									maxValue={maxCountryCount}
									limit={5}
								/>
							</div>
							{mapCountries.length > 5 && (
								<div className="shrink-0 px-4 py-3 ">
									<div className="flex items-center justify-center">
										<Button
											variant="outline"
											onClick={() =>
												setCountriesDialogOpen(true)
											}
											className="text-muted-foreground">
											<ExpandIcon className="h-4 w-4 mr-1" />
											View all
										</Button>
									</div>
								</div>
							)}
						</div>
						<ViewAllStats
							name="countries"
							dialogOpen={countriesDialogOpen}
							setDialogOpen={setCountriesDialogOpen}
							allLinks={mapCountries}
							maxTotalCount={maxCountryCount}
							bgColor="bg-green"
						/>
					</TabsContent>

					<TabsContent value="cities" className="h-full m-0 p-0">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
								<BarList
									tab="Cities"
									unit="visits"
									data={topCities}
									barBackground="bg-green-200"
									hoverBackground="hover:bg-green-50"
									maxValue={maxCityCount}
									limit={5}
								/>
							</div>
							{mapCities.length > 5 && (
								<div className="shrink-0 px-4 py-3 ">
									<div className="flex items-center justify-center">
										<Button
											variant="outline"
											onClick={() =>
												setCitiesDialogOpen(true)
											}
											className="text-muted-foreground">
											<ExpandIcon className="h-4 w-4 mr-1" />
											View all
										</Button>
									</div>
								</div>
							)}
						</div>
						<ViewAllStats
							name="cities"
							dialogOpen={citiesDialogOpen}
							setDialogOpen={setCitiesDialogOpen}
							allLinks={mapCities}
							maxTotalCount={maxCityCount}
							bgColor="bg-green"
						/>
					</TabsContent>

					<TabsContent value="continents" className="h-full m-0 p-0">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
								<BarList
									tab="Continents"
									unit="visits"
									data={topContinents}
									barBackground="bg-green-200"
									hoverBackground="hover:bg-green-50"
									maxValue={maxContinentCount}
									limit={5}
								/>
							</div>
							{mapContinents.length > 5 && (
								<div className="shrink-0 px-4 py-3 ">
									<div className="flex items-center justify-center">
										<Button
											variant="outline"
											onClick={() =>
												setContinentsDialogOpen(
													true,
												)
											}
											className="text-muted-foreground">
											<ExpandIcon className="h-4 w-4 mr-1" />
											View all
										</Button>
									</div>
								</div>
							)}
						</div>
						<ViewAllStats
							name="continents"
							dialogOpen={continentsDialogOpen}
							setDialogOpen={setContinentsDialogOpen}
							allLinks={mapContinents}
							maxTotalCount={maxContinentCount}
							bgColor="bg-green"
						/>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
