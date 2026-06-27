import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { ExpandIcon } from "lucide-react";
import { useState } from "react";
import BarList from "./bar-list";
import { Africa } from "../continents/af";
import { Asia } from "../continents/as";
import { Europe } from "../continents/eu";
import { NorthAmerica } from "../continents/na";
import { Oceania } from "../continents/oc";
import { SouthAmerica } from "../continents/sa";
import { ViewAllStats } from "./view-stats";

type TimeRange = "24h" | "7d" | "30d" | "90d";

const continentIcons = {
	Africa,
	Asia,
	Europe,
	"North America": NorthAmerica,
	Oceania,
	"South America": SouthAmerica,
} as const;

function getFlagIcon(countryCode: string | undefined, title: string) {
	if (!countryCode) return null;

	return (
		<img src={`https://flag.vercel.app/m/${countryCode}.svg`} className="w-4" alt={title} />
	);
}

function NoDataMessage() {
	return (
		<div className="flex h-full items-center justify-center text-sm font-normal text-foreground">
			No data available yet
		</div>
	);
}

export function TopCountries({ timeRange }: { timeRange: TimeRange }) {
	const [countriesDialogOpen, setCountriesDialogOpen] = useState(false);
	const [citiesDialogOpen, setCitiesDialogOpen] = useState(false);
	const [continentsDialogOpen, setContinentsDialogOpen] = useState(false);
	const trpc = useTRPC();
	const { data: locationsData } = useQuery(
		trpc.analytics.locations.queryOptions({ timeRange })
	);
	const locations = locationsData ?? { countries: [], cities: [], continents: [] };

	const mapCountries = locations.countries.map((country) => ({
		icon: getFlagIcon(country.countryCode, country.title),
		title: country.title,
		value: country.value,
		href: "",
		linkId: country.countryCode ?? country.title,
	}));
	const mapCities = locations.cities.map((city) => ({
		icon: getFlagIcon(city.countryCode, city.title),
		title: city.title,
		value: city.value,
		href: "",
		linkId: `${city.countryCode ?? "city"}-${city.title}`,
	}));
	const mapContinents = locations.continents.map((continent) => {
		const Icon = continentIcons[continent.title as keyof typeof continentIcons];

		return {
			icon: Icon ? <Icon className="w-4" /> : null,
			title: continent.title,
			value: continent.value,
			href: "",
			linkId: continent.title,
		};
	});

	const topCountries = mapCountries.slice(0, 5);
	const topCities = mapCities.slice(0, 5);
	const topContinents = mapContinents.slice(0, 5);

	const maxCountryCount = Math.max(0, ...mapCountries.map((c) => c.value));
	const maxCityCount = Math.max(0, ...mapCities.map((c) => c.value));
	const maxContinentCount = Math.max(0, ...mapContinents.map((c) => c.value));

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
				</div>

				<div className="flex-1 min-h-0 overflow-hidden">
					<TabsContent value="countries" className="h-full m-0 p-0">
						<div className="h-full flex flex-col">
							<div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
								{topCountries.length > 0 ? (
									<BarList
										tab="Countries"
										unit="visits"
										data={topCountries}
										barBackground="bg-green-200"
										hoverBackground="hover:bg-green-50"
										maxValue={maxCountryCount}
										limit={5}
									/>
								) : (
									<NoDataMessage />
								)}
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
								{topCities.length > 0 ? (
									<BarList
										tab="Cities"
										unit="visits"
										data={topCities}
										barBackground="bg-green-200"
										hoverBackground="hover:bg-green-50"
										maxValue={maxCityCount}
										limit={5}
									/>
								) : (
									<NoDataMessage />
								)}
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
								{topContinents.length > 0 ? (
									<BarList
										tab="Continents"
										unit="visits"
										data={topContinents}
										barBackground="bg-green-200"
										hoverBackground="hover:bg-green-50"
										maxValue={maxContinentCount}
										limit={5}
									/>
								) : (
									<NoDataMessage />
								)}
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
