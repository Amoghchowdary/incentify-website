import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypes, serviceOptions } from "@/data/services";
import { indianStates } from "@/data/states";
import { submitLead, type LeadSource } from "@/lib/lead-submission";

const phoneRegex = /^(?:\+91[-\s]?)?[6-9]\d{9}$/;

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name must be under 80 characters"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Enter a valid email address")
    .max(120, "Email must be under 120 characters"),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  businessType: z.string().min(1, "Select your business type"),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().min(1, "Select your state"),
  service: z.string().min(1, "Select the service you need"),
  contactMethod: z.string().min(1, "Select a preferred contact method"),
  contactTime: z.string().min(1, "Select a preferred contact time"),
  companyWebsite: z.string().max(0, "Leave this field empty").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your requirement in at least 10 characters")
    .max(1000, "Please keep the description under 1000 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LeadForm({
  source = "quote",
  defaultService,
  title = "Request a quotation",
  description = "Share your requirement and our team will respond with the applicable scope, documents and fees.",
}: {
  source?: LeadSource;
  defaultService?: string;
  title?: string;
  description?: string;
}) {
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      businessName: "",
      businessType: "",
      city: "",
      state: "",
      service: defaultService ?? "",
      contactMethod: "Phone call",
      contactTime: "Any time during business hours",
      companyWebsite: "",
      message: "",
    },
  });

  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setError(null);
    const result = await submitLead({
      source,
      ...values,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      submittedAt: new Date().toISOString(),
    });
    if (result.ok) {
      setReference(result.reference);
      form.reset();
    } else {
      setError(result.error);
    }
  }

  if (reference) {
    return (
      <div
        role="status"
        className="rounded-lg border border-border bg-card p-6 shadow-card md:p-8"
      >
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Thank you. Your request has been received.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The Incentify team will contact you regarding the next steps. Your reference number is{" "}
          <span className="font-semibold text-foreground">{reference}</span>.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setReference(null)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card md:p-8">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="companyWebsite">Company website</label>
            <input
              id="companyWebsite"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register("companyWebsite")}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name *</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number *</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="9876543210"
                      maxLength={14}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address *</FormLabel>
                  <FormControl>
                    <Input type="email" inputMode="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" maxLength={120} {...field} />
                  </FormControl>
                  <FormDescription>Leave blank if not yet registered.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SelectField
              control={form.control}
              name="businessType"
              label="Business type *"
              placeholder="Select business type"
              options={businessTypes}
            />
            <SelectField
              control={form.control}
              name="service"
              label="Service required *"
              placeholder="Select a service"
              options={serviceOptions}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input autoComplete="address-level2" maxLength={60} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SelectField
              control={form.control}
              name="state"
              label="State *"
              placeholder="Select state"
              options={indianStates}
            />
            <SelectField
              control={form.control}
              name="contactMethod"
              label="Preferred contact method *"
              placeholder="Select a method"
              options={["Phone call", "WhatsApp", "Email"]}
            />
            <SelectField
              control={form.control}
              name="contactTime"
              label="Preferred contact time *"
              placeholder="Select a time"
              options={[
                "Any time during business hours",
                "Morning (10 AM – 1 PM)",
                "Afternoon (1 PM – 4 PM)",
                "Evening (4 PM – 6 PM)",
              ]}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirement description *</FormLabel>
                <FormControl>
                  <Textarea rows={4} maxLength={1000} {...field} />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/1000 characters. Briefly describe what you need.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Fields marked * are required. We use your details only to respond to this enquiry.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

function SelectField({
  control,
  name,
  label,
  placeholder,
  options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { SelectField, phoneRegex };
